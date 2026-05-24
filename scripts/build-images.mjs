#!/usr/bin/env node
/**
 * Build-time responsive image generator.
 *
 * - Reads source images from assets/images/
 * - Copies originals + generates width-constrained WebP variants to public/images/
 * - Emits public/images/_manifest.json for srcset resolution
 *
 * Run manually:   node scripts/build-images.mjs
 * Or via npm:     npm run build:images
 */

import { readdir, stat, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const INPUT_DIR = path.resolve(process.cwd(), 'assets', 'images');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'images');
const MANIFEST_PATH = path.join(OUTPUT_DIR, '_manifest.json');
const SKIP_EXISTING = process.argv.includes('--skip-existing');

const WIDTHS = [320, 480, 640, 960, 1280, 1600, 1920, 2560];
const WEBP_QUALITY = 78;
const WEBP_QUALITY_PNGISH = 90;
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/**
 * @param {string} dir
 * @returns {AsyncGenerator<{inputPath: string, relPath: string}>}
 */
async function* walkImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkImages(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTS.has(ext)) {
        const relPath = path.relative(INPUT_DIR, fullPath);
        yield { inputPath: fullPath, relPath };
      }
    }
  }
}

/**
 * @param {string} relPath
 */
function toWebPath(relPath) {
  const posix = relPath.replace(/\\/g, '/');
  return `/images/${posix}`;
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function main() {
  const startTime = performance.now();

  try {
    await stat(INPUT_DIR);
  } catch {
    console.error(`[build-images] Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  if (!SKIP_EXISTING) {
    // Clean output dir but keep .gitkeep if present
    const gitkeepPath = path.join(OUTPUT_DIR, '.gitkeep');
    let hasGitkeep = false;
    try {
      await stat(gitkeepPath);
      hasGitkeep = true;
    } catch { /* ignore */ }

    try {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } catch { /* ignore */ }

    await ensureDir(OUTPUT_DIR);
    if (hasGitkeep) {
      await writeFile(gitkeepPath, '', 'utf-8');
    }
  }

  /** @type {Record<string, {webp: Array<{src: string, width: number, height: number}>}>} */
  const manifest = {};
  let processed = 0;

  for await (const { inputPath, relPath } of walkImages(INPUT_DIR)) {
    const inputExt = path.extname(relPath).toLowerCase();
    const stem = path.basename(relPath, inputExt);
    const relDir = path.dirname(relPath);
    const outDir = path.join(OUTPUT_DIR, relDir);
    await ensureDir(outDir);

    // Copy original to public/images/ so it is available locally and for S3 sync
    const originalOutPath = path.join(outDir, path.basename(relPath));
    await copyFile(inputPath, originalOutPath);

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const origW = metadata.width ?? 0;
    const origH = metadata.height ?? 0;
    const hasAlpha = metadata.hasAlpha || inputExt === '.png' || inputExt === '.gif';

    if (origW === 0 || origH === 0) {
      console.warn(`[build-images] Skipping unreadable image: ${relPath}`);
      continue;
    }

    const targetWidths = WIDTHS.filter((w) => w <= origW);
    if (targetWidths.length === 0) {
      targetWidths.push(origW);
    }

    /** @type {Array<{src: string, width: number, height: number}>} */
    const webpVariants = [];

    for (const w of targetWidths) {
      const h = Math.round(origH * (w / origW));
      const variantName = `${stem}-w${w}.webp`;
      const variantPath = path.join(outDir, variantName);

      if (SKIP_EXISTING) {
        try {
          await stat(variantPath);
          webpVariants.push({
            src: toWebPath(path.join(relDir, variantName)),
            width: w,
            height: h,
          });
          continue;
        } catch { /* not found, generate */ }
      }

      const resize = image.clone().resize(w, h, { fit: 'inside', withoutEnlargement: true });

      if (hasAlpha) {
        await resize.webp({ lossless: true, effort: 6 }).toFile(variantPath);
      } else {
        const quality = inputExt === '.png' ? WEBP_QUALITY_PNGISH : WEBP_QUALITY;
        await resize.webp({ quality, effort: 6 }).toFile(variantPath);
      }

      webpVariants.push({
        src: toWebPath(path.join(relDir, variantName)),
        width: w,
        height: h,
      });
    }

    manifest[toWebPath(relPath)] = { webp: webpVariants };
    processed++;

    if (processed % 5 === 0) {
      console.log(`[build-images] Processed ${processed} images...`);
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(`[build-images] Done. ${processed} images, ${Object.keys(manifest).length} manifest entries in ${elapsed}s`);
}

main().catch((err) => {
  console.error('[build-images] Failed:', err);
  process.exit(1);
});
