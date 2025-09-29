import { YearBadge } from '@/components/YearBadge';
import { StatsBadge } from '@/components/StatsBadge';
import { useDiscordStats } from '@/hooks/useDiscordStats';
import { useVerseYear } from '@/hooks/useVerseYear';

import styles from './HeroSection.module.css';

interface HeroSectionProps {
  onJoin: () => void;
  onDiscord: () => void;
}

export function HeroSection({ onJoin, onDiscord }: HeroSectionProps) {
  const { foundationYear, verseYear, showRange } = useVerseYear();
  const { presenceCount, inVoice } = useDiscordStats();

  return (
    <section className={styles.hero} id="top">
      <YearBadge foundationYear={foundationYear} verseYear={verseYear} showRange={showRange} />
      <StatsBadge onlineMembers={presenceCount} inVoice={inVoice} />
      <div className={styles.content}>
        <img src="/images/HSTC-Logo.webp" alt="HSTC Logo" className={styles.logo} loading="eager" />
        <h1 className={styles.title}>HSTC</h1>
        <h2 className={styles.subtitle}>Helvetic Security &amp; Transport Corporation</h2>
        <p className={styles.tagline}>
          D/A/CH-Elite im Verse <span className={styles.salute}>o7</span>
        </p>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.actions}>
          <button className="btn" type="button" onClick={onJoin}>
            Jetzt beitreten
          </button>
          <button className="btn btn-outline" type="button" onClick={onDiscord}>
            Discord
          </button>
        </div>
      </div>
    </section>
  );
}
