import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getBestImageUrl, getSrcSet, guessInitialUrl } from '@/utils/imageManifest';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string; // original base path in /images or remote
  sizes?: string; // optional override; if omitted, component will auto-size to element width
  autoSize?: boolean; // default true: measure element and set sizes to <width>px
};

/**
 * ResponsiveImage: uses the generated manifest to load best-fit variant.
 * - For local /images/* sources, it sets src/srcSet/sizes.
 * - For remote URLs or missing manifest entries, it gracefully falls back to given src.
 */
export const ResponsiveImage = forwardRef<HTMLImageElement, Props>(function ResponsiveImage(
  { src, sizes, autoSize = true, loading = 'lazy', decoding = 'async', ...rest }: Props,
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
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => guessInitialUrl(src) || src);
  const [resolvedSrcSet, setResolvedSrcSet] = useState<string>('');
  const [resolvedSizes, setResolvedSizes] = useState<string | undefined>(sizes);

  // Resolve srcset from manifest (async)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ss] = await Promise.all([getSrcSet(src)]);
        if (!cancelled && ss) setResolvedSrcSet(ss);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

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
