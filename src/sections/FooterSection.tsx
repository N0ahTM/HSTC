import { useVerseYear } from '@/hooks/useVerseYear';

import styles from './FooterSection.module.css';

export function FooterSection() {
  const { foundationYear, verseYear, showRange } = useVerseYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.logo}>HSTC</div>
        <p className={styles.text}>
          © {foundationYear}
          {showRange ? ` – ${verseYear}` : ''} Helvetic Security &amp; Transport Corporation · Die Elite im Verse
        </p>
      </div>
    </footer>
  );
}
