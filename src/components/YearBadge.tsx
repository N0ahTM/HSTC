import { ForwardedRef, forwardRef } from 'react';

import styles from './YearBadge.module.css';

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
  { verseYear, foundationYear, showRange }: YearBadgeProps,
  ref: ForwardedRef<HTMLElement>
) {
  return (
    <aside ref={ref} className={styles.badge} aria-label="Herkunftsländer und Gründungsjahr">
      <div className={styles.flags} aria-label="Herkunftsländer">
        {flags.map((flag) => (
          <span key={flag.alt} className={styles.flag}>
            <img src={flag.src} alt={flag.alt} loading="lazy" />
          </span>
        ))}
      </div>
      <span className={styles.year} aria-label="Seit dem Jahr">
        Seit 2017
      </span>
    </aside>
  );
});
