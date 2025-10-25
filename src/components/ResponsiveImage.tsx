import React, { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getBestImageUrl, getSrcSetSync, guessInitialUrl } from '@/utils/imageManifest';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string; // original base path in /images or remote
  sizes?: string; // optional override; if omitted, component will auto-size to element width
  autoSize?: boolean; // default true: measure element and set sizes to <width>px
  initialWidth?: number; // optional hint for the first requested width before measurements run
  fetchPriority?: 'high' | 'low' | 'auto';
};

const DEFAULT_PLACEHOLDER_WIDTH = 320;
const MAX_INITIAL_WIDTH = 640;

function parseNumericWidth(value: Props['width']): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractPxFromSizes(sizes?: string): number | null {
  if (!sizes) return null;
  const match = sizes.match(/(\d+)\s*px/);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * ResponsiveImage: uses the generated manifest to load best-fit variant.
 * - For local /images/* sources, it sets src/srcSet/sizes.
 * - For remote URLs or missing manifest entries, it gracefully falls back to given src.
 */
export const ResponsiveImage = forwardRef<HTMLImageElement, Props>(function ResponsiveImage(
  { src, sizes, autoSize = true, loading = 'lazy', decoding = 'async', initialWidth, fetchPriority, ...rest }: Props,
  ref
) {
  const imgRef = useRef<HTMLImageElement>(null);
  const setRefs = (node: HTMLImageElement | null) => {
    (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && 'current' in (ref as any)) {
      (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
    }
  };
  const sizeHint = useMemo(() => {
    if (typeof initialWidth === 'number' && initialWidth > 0) {
      return Math.min(initialWidth, MAX_INITIAL_WIDTH);
    }
    const widthAttr = parseNumericWidth(rest.width);
    if (widthAttr) {
      return Math.min(widthAttr, MAX_INITIAL_WIDTH);
    }
    const pxFromSizes = extractPxFromSizes(sizes);
    if (pxFromSizes) {
      return Math.min(pxFromSizes, MAX_INITIAL_WIDTH);
    }
    return DEFAULT_PLACEHOLDER_WIDTH;
  }, [initialWidth, rest.width, sizes]);

  const [resolvedSrc, setResolvedSrc] = useState<string>(() => guessInitialUrl(src, sizeHint) || src);
  const resolvedSrcSet = useMemo(() => getSrcSetSync(src), [src]);
  const [resolvedSizes, setResolvedSizes] = useState<string | undefined>(sizes);

  useEffect(() => {
    setResolvedSrc(guessInitialUrl(src, sizeHint) || src);
  }, [sizeHint, src]);

  useEffect(() => {
    setResolvedSizes(sizes);
  }, [sizes]);

  // Keep fetchpriority attribute in sync without triggering React warnings
  useEffect(() => {
    if (!fetchPriority) {
      if (imgRef.current) {
        imgRef.current.removeAttribute('fetchpriority');
      }
      return;
    }
    const node = imgRef.current;
    if (!node) return;
    node.setAttribute('fetchpriority', fetchPriority);
    return () => {
      node.removeAttribute('fetchpriority');
    };
  }, [fetchPriority]);

  // Auto measure element width and select best variant
  useLayoutEffect(() => {
    if (!autoSize) return;
    const el = imgRef.current;
    if (!el) return;
    let raf = 0;
    let cancelled = false;
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const update = async () => {
      if (!el || cancelled) return;
      const rect = el.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || (el as any).clientWidth || 0));
      if (width > 0) {
        try {
          const best = await getBestImageUrl(src, width, dpr);
          if (!cancelled && best) setResolvedSrc(best);
          if (!sizes && !cancelled) setResolvedSizes(`${width}px`);
        } catch {
          // ignore
        }
      }
    };

    // Initial measure next frame for layout to settle
    raf = window.requestAnimationFrame(update);
    const ro = new ResizeObserver(() => {
      // debounce via rAF
      if (raf) cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    });
    ro.observe(el);
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
    };
  }, [src, sizes, autoSize]);

  // If autoSize disabled but sizes provided, still pick a decent src quickly
  useEffect(() => {
    if (autoSize) return; // handled by measurement
    let cancelled = false;
    (async () => {
      try {
        const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
        const cssWidth = typeof sizes === 'string' && sizes.endsWith('px') ? parseInt(sizes, 10) || 640 : 640;
        const best = await getBestImageUrl(src, cssWidth, dpr);
        if (!cancelled && best) setResolvedSrc(best);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoSize, sizes, src]);

  return (
    <img
      ref={setRefs}
      src={resolvedSrc || src}
      srcSet={resolvedSrcSet || undefined}
      sizes={resolvedSizes}
      loading={loading}
      decoding={decoding as any}
      {...rest}
    />
  );
});

export default ResponsiveImage;
