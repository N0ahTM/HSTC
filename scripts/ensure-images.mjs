#!/usr/bin/env node

import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const MANIFEST_PATH = path.resolve(process.cwd(), 'public', 'images', '_manifest.json');
const forceBuild = String(process.env.FORCE_IMAGE_BUILD ?? '').toLowerCase() === 'true';
const isCi = String(process.env.CI ?? '').toLowerCase() === 'true';

async function manifestExists() {
  try {
    await access(MANIFEST_PATH);
    return true;
  } catch {
    return false;
  }
}

function runBuildImages() {
  const result = spawnSync('node', ['scripts/build-images.mjs', '--skip-existing'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const hasManifest = await manifestExists();
if (!forceBuild && isCi && hasManifest) {
  console.log('[ensure-images] CI detected and manifest exists, skipping image build.');
  process.exit(0);
}

if (!hasManifest) {
  console.log('[ensure-images] Missing manifest, generating responsive images.');
  runBuildImages();
  process.exit(0);
}

if (forceBuild) {
  console.log('[ensure-images] FORCE_IMAGE_BUILD=true, regenerating responsive images.');
  runBuildImages();
  process.exit(0);
}

console.log('[ensure-images] Manifest exists, skipping image build.');
