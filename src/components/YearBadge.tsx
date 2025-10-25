import { ForwardedRef, forwardRef } from 'react';
import { useLayoutEffect, useRef } from 'react';

import styles from './YearBadge.module.css';
import ResponsiveImage from '@/components/ResponsiveImage';

interface YearBadgeProps {
  verseYear: number;
  foundationYear: number;
  showRange: boolean;
}

const flags = [
  { src: '/images/flags/switzerland-flag-square-medium.webp', alt: 'Schweiz' },
  { src: '/images/flags/germany-flag-square-medium.webp', alt: 'Deutschland' },
  { src: '/images/flags/austria-flag-square-medium.webp', alt: 'Österreich' }
];

export const YearBadge = forwardRef(function YearBadge(
  { verseYear: _verseYear, foundationYear: _foundationYear, showRange: _showRange }: YearBadgeProps,
  ref: ForwardedRef<HTMLElement>
) {
  // NOTE: Currently the props are not used in the visual, keeping signature for future use.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalBadgeRef = useRef<HTMLElement | null>(null);

  // Keep external ref (forwarded) in sync with internal badge ref.
  function setBadgeRef(node: HTMLElement | null) {
    internalBadgeRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && 'current' in (ref as object)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref as any).current = node;
    }
  }

  useLayoutEffect(() => {
    const badgeEl = internalBadgeRef.current;
    const containerEl = containerRef.current;
    if (!badgeEl || !containerEl) return;

    function applyWidth() {
      if (!badgeEl || !containerEl) return;
      const w = badgeEl.getBoundingClientRect().width;
      containerEl.style.width = w ? `${w}px` : '';
    }
    applyWidth();

    const ro = new ResizeObserver(applyWidth);
    ro.observe(badgeEl);
    window.addEventListener('resize', applyWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', applyWidth);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.badgeContainer} aria-label="Herkunft & Community Abzeichen">
      <aside ref={setBadgeRef} className={styles.badge} aria-label="Herkunftsländer und Gründungsjahr">
        <div className={styles.flags} aria-label="Herkunftsländer">
          {flags.map((flag) => (
            <span key={flag.alt} className={styles.flag}>
              <ResponsiveImage src={flag.src} alt={flag.alt} loading="lazy" width={28} height={28} autoSize={false} sizes="28px" />
            </span>
          ))}
        </div>
        <span className={styles.year} aria-label="Seit dem Jahr">
          Seit 2017
        </span>
      </aside>
      <div className={styles.community} aria-label="Star Citizen Community Hinweis">
        <ResponsiveImage
          src="/images/MadeByTheCommunity_Black.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={300}
          height={60}
          autoSize
        />
      </div>
    </div>
  );
});
