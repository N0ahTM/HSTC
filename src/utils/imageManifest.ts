/**
 * Manifest-driven responsive image utilities.
 *
 * Loads the statically generated /images/_manifest.json (produced by scripts/optimize_images.py)
 * and provides helpers to select the best variant for a given display size.
 */

import rawManifest from '../../public/images/_manifest.json';
import { getAssetBaseUrl } from '@/config/amplifyOutputs';

export type ImageVariant = {
  src: string;
  width: number;
  height: number;
  format?: string; // e.g., 'webp', 'avif'
};

export type ImageManifest = Record<
  string,
  {
    webp?: ImageVariant[];
    avif?: ImageVariant[];
  }
>;

type NormalizedManifest = Record<string, ImageVariant[]>; // key: original web path '/images/..'

const manifest: NormalizedManifest = normalizeManifest(rawManifest as ImageManifest);
const DEFAULT_PLACEHOLDER_WIDTH = 320;
const ASSET_BASE_URL = getAssetBaseUrl();

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('//');
}

function normalizeRequestUrl(source: string): string {
  if (!source) return source;
  const normalized = source.replace(/\\/g, '/').trim();
  if (!normalized) return normalized;
  if (isAbsoluteUrl(normalized)) {
    return normalized;
  }
  const lower = normalized.toLowerCase();
  const marker = '/images/';
  const markerIdx = lower.indexOf(marker);
  if (markerIdx >= 0) {
    return normalized.slice(markerIdx);
  }
  const markerNoSlash = 'images/';
  const markerNoSlashIdx = lower.indexOf(markerNoSlash);
  if (markerNoSlashIdx >= 0) {
    return `/${normalized.slice(markerNoSlashIdx)}`;
  }
  if (normalized.startsWith('/')) {
    return normalized;
  }
  if (normalized.startsWith('./')) {
    return normalized.slice(1);
  }
  if (normalized.startsWith('images/')) {
    return `/${normalized}`;
  }
  if (normalized.startsWith('./images/')) {
    return normalized.replace(/^\./, '');
  }
  return normalized.startsWith('/images/') ? normalized : `/images/${normalized}`;
}

function toDeliveryUrl(source: string): string {
  const normalized = normalizeRequestUrl(source);
  if (normalized.startsWith('/images/')) {
    return `${ASSET_BASE_URL}${normalized}`;
  }
  return normalized;
}

function manifestKeyFromUrl(source: string): string | null {
  const normalized = normalizeRequestUrl(source);
  return normalized.startsWith('/images/') ? normalized : null;
}

function normalizeManifest(raw: ImageManifest): NormalizedManifest {
  const map: NormalizedManifest = {};
  for (const [rawKey, entry] of Object.entries(raw)) {
    const manifestKey = manifestKeyFromUrl(rawKey);
    if (!manifestKey) {
      continue;
    }
    const all: ImageVariant[] = [];
    const pushList = (list?: ImageVariant[], format?: string) => {
      if (!list) return;
      for (const variant of list) {
        all.push({
          src: normalizeRequestUrl(variant.src),
          width: variant.width,
          height: variant.height,
          format
        });
      }
    };
    pushList(entry.webp, 'webp');
    pushList(entry.avif, 'avif');
    if (!all.length) {
      continue;
    }
    const dedup = new Map<string, ImageVariant>();
    for (const v of all) {
      dedup.set(`${v.format || 'webp'}:${v.width}`, v);
    }
    map[manifestKey] = Array.from(dedup.values()).sort((a, b) => a.width - b.width);
  }
  return map;
}

function getVariantsFor(url: string): ImageVariant[] | undefined {
  const key = manifestKeyFromUrl(url);
  if (!key) return undefined;
  return manifest[key];
}

function pickVariantByWidth(variants: ImageVariant[], targetWidth: number): ImageVariant {
  const target = Math.max(1, Math.round(targetWidth));
  return variants.find((v) => v.width >= target) ?? variants[variants.length - 1];
}

function effectiveTargetWidth(cssWidth: number, dpr: number): number {
  const clampedDpr = Math.max(1, Math.min(2.5, dpr || 1));
  return Math.max(1, Math.round(cssWidth * clampedDpr));
}

/**
 * Select the best variant given desired CSS pixels and device pixel ratio.
 * If no variants exist, returns the normalized original URL.
 */
export async function getBestImageUrl(originalUrl: string, desiredCssWidth: number, dpr = 1): Promise<string> {
  const fallback = toDeliveryUrl(originalUrl);
  const variants = getVariantsFor(originalUrl);
  if (!variants || variants.length === 0) {
    return fallback;
  }
  const candidate = pickVariantByWidth(variants, effectiveTargetWidth(desiredCssWidth, dpr));
  return toDeliveryUrl(candidate.src);
}

/** Build a srcset string from manifest variants. Fallback to empty string when missing. */
export async function getSrcSet(originalUrl: string): Promise<string> {
  return getSrcSetSync(originalUrl);
}

export function getSrcSetSync(originalUrl: string): string {
  const variants = getVariantsFor(originalUrl);
  if (!variants || variants.length === 0) {
    return '';
  }
  const uniqueByWidth = new Map<number, ImageVariant>();
  for (const v of variants) {
    if (!uniqueByWidth.has(v.width)) {
      uniqueByWidth.set(v.width, v);
    }
  }
  const items = Array.from(uniqueByWidth.values()).sort((a, b) => a.width - b.width);
  return items.map((v) => `${toDeliveryUrl(v.src)} ${v.width}w`).join(', ');
}

/**
 * Convenience: compute a best-effort immediate URL synchronously by guessing variant naming when no manifest entry exists.
 * Useful as initial src placeholder. It tries to downshift to a modest size to avoid large upfront downloads.
 */
export function guessInitialUrl(originalUrl: string, preferredWidth = DEFAULT_PLACEHOLDER_WIDTH): string {
  const variants = getVariantsFor(originalUrl);
  if (variants && variants.length > 0) {
    return toDeliveryUrl(pickVariantByWidth(variants, preferredWidth).src);
  }
  const fallback = normalizeRequestUrl(originalUrl);
  if (!fallback.startsWith('/images/')) {
    return fallback;
  }
  const idx = fallback.lastIndexOf('.');
  if (idx <= 0) return fallback;
  const base = fallback.slice(0, idx);
  const ext = fallback.slice(idx);
  const width = Math.max(64, Math.round(preferredWidth || DEFAULT_PLACEHOLDER_WIDTH));
  return toDeliveryUrl(`${base}-w${width}${ext}`);
}

/**
 * For background images: select best URL based on a given element width.
 */
export async function selectBackgroundUrl(originalUrl: string, elementWidth: number, dpr = 1): Promise<string> {
  return getBestImageUrl(originalUrl, elementWidth, dpr);
}

/**
 * Public API: preload manifest early, e.g., in app bootstrap.
 */
export function warmImageManifest(): void {
  void manifest;
}
