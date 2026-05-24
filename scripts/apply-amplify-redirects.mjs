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

const rulesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'amplify-redirects.json');
const rules = readFileSync(rulesPath, 'utf8').trim();

const result = spawnSync(
  'aws',
  ['amplify', 'update-app', '--app-id', appId, '--custom-rules', rules],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
);

if (result.status !== 0) {
  console.error('[redirects] aws amplify update-app failed:');
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

console.log(`[redirects] Applied ${JSON.parse(rules).length} custom rules to app ${appId}.`);
