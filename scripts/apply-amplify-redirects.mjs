#!/usr/bin/env node
/**
 * Applies amplify-redirects.json to the Amplify app via AWS CLI.
 * Runs in CI when AWS_APP_ID is set (Amplify Hosting build environment).
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appId = process.env.AWS_APP_ID?.trim();
if (!appId) {
  console.log('[redirects] AWS_APP_ID not set — skipping custom rules update (local build).');
  process.exit(0);
}

const branch = (process.env.AWS_BRANCH ?? '').trim();
const protectedBranches = new Set(['main', 'master', 'production']);
const forceApply = String(process.env.AMPLIFY_FORCE_REDIRECT_UPDATE ?? '').toLowerCase() === 'true';
if (!forceApply && branch && !protectedBranches.has(branch)) {
  console.log(`[redirects] Branch "${branch}" is not a protected deploy branch — skipping redirect update.`);
  process.exit(0);
}

const rulesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'amplify-redirects.json');
const rulesRaw = readFileSync(rulesPath, 'utf8').trim();
const parsedRules = JSON.parse(rulesRaw);
if (!Array.isArray(parsedRules) || parsedRules.length === 0) {
  throw new Error('[redirects] amplify-redirects.json must contain a non-empty array.');
}
for (const [index, rule] of parsedRules.entries()) {
  const source = typeof rule?.source === 'string' ? rule.source.trim() : '';
  const target = typeof rule?.target === 'string' ? rule.target.trim() : '';
  const status = typeof rule?.status === 'string' ? rule.status.trim() : '';
  if (!source || !target || !status) {
    throw new Error(`[redirects] Invalid redirect rule at index ${index}: source/target/status required.`);
  }
}

function awsAmplifyJson(args) {
  const result = spawnSync('aws', ['amplify', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || '[redirects] AWS command failed.');
  }
  return JSON.parse(result.stdout);
}

let existingRules = [];
try {
  const app = awsAmplifyJson(['get-app', '--app-id', appId]);
  existingRules = Array.isArray(app?.app?.customRules) ? app.app.customRules : [];
} catch (error) {
  console.warn('[redirects] Unable to read current custom rules before update:', error);
}

const normalize = (rules) => JSON.stringify(rules);
if (existingRules.length > 0 && normalize(existingRules) === normalize(parsedRules)) {
  console.log(`[redirects] Custom rules already up to date for app ${appId}.`);
  process.exit(0);
}

const result = spawnSync(
  'aws',
  ['amplify', 'update-app', '--app-id', appId, '--custom-rules', rulesRaw],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
);

if (result.status !== 0) {
  const strict = String(process.env.AMPLIFY_REDIRECT_UPDATE_STRICT ?? '').toLowerCase() === 'true';
  const output = result.stderr || result.stdout;
  if (strict) {
    console.error('[redirects] aws amplify update-app failed (strict mode):');
    console.error(output);
    process.exit(result.status ?? 1);
  }
  console.warn('[redirects] aws amplify update-app failed — continuing build (non-strict mode).');
  console.warn(output);
  process.exit(0);
}

console.log(`[redirects] Applied ${parsedRules.length} custom rules to app ${appId}.`);
