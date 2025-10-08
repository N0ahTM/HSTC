import { useRef } from 'react';

import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { useVerseYear } from '@/hooks/useVerseYear';

import styles from './FooterSection.module.css';

export function FooterSection() {
  const { foundationYear, verseYear, showRange } = useVerseYear();
  const footerRef = useRef<HTMLElement | null>(null);

  useStaggerReveal(footerRef, { rootMargin: '0px', translateY: 12, duration: 420, delay: 40 });

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className="container">
        <div className={styles.logo}>HSTC</div>
        <p className={styles.text}>
          © {foundationYear}
          {showRange ? ` – ${verseYear}` : ''} Helvetic Security &amp; Transport Corporation
        </p>
      </div>
    </footer>
  );
}
