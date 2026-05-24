import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

let outputs = null;
try {
  const outputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  outputs = JSON.parse(readFileSync(outputsPath, 'utf-8'));
} catch {
  outputs = null;
}

let bucket = (process.env.ASSET_S3_BUCKET ?? '').trim();
if (!bucket) {
  const candidate = outputs?.custom?.assetBucketName;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    bucket = candidate.trim();
  }
}
if (!bucket) {
  throw new Error('Missing asset bucket. Set ASSET_S3_BUCKET or provide custom.assetBucketName in amplify_outputs.json.');
}

const prefix = (process.env.ASSET_S3_PREFIX ?? '').trim().replace(/^\/+|\/+$/g, '');
const distributionId =
  (process.env.ASSET_CLOUDFRONT_DISTRIBUTION_ID ?? '').trim() ||
  (typeof outputs?.custom?.assetDistributionId === 'string' ? outputs.custom.assetDistributionId.trim() : '');
const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'public', 'images');
const targetBase = prefix ? `s3://${bucket}/${prefix}` : `s3://${bucket}`;
const targetPath = `${targetBase}/images`;

console.info(`[assets] Syncing ${sourceDir} -> ${targetPath}`);
run('aws', [
  's3',
  'sync',
  sourceDir,
  targetPath,
  '--delete',
  '--cache-control',
  'public,max-age=31536000,immutable'
]);

if (distributionId) {
  console.info(`[assets] Invalidating CloudFront distribution ${distributionId}`);
  run('aws', [
    'cloudfront',
    'create-invalidation',
    '--distribution-id',
    distributionId,
    '--paths',
    '/images/*'
  ]);
} else {
  console.info('[assets] No ASSET_CLOUDFRONT_DISTRIBUTION_ID provided; skipping invalidation.');
}
