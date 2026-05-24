import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

const bucket = (process.env.ASSET_S3_BUCKET ?? '').trim();
if (!bucket) {
  throw new Error('Missing ASSET_S3_BUCKET env var.');
}

const prefix = (process.env.ASSET_S3_PREFIX ?? '').trim().replace(/^\/+|\/+$/g, '');
const distributionId = (process.env.ASSET_CLOUDFRONT_DISTRIBUTION_ID ?? '').trim();
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
  'public, max-age=31536000, immutable'
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
