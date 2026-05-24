import { useCallback, useRef, type MouseEvent } from 'react';
import anime from 'animejs';

import { SectionHeading } from '@/lib/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { buttonPress } from '@/lib/motion';
import { useDiscordStats } from '@/hooks/useDiscordStats';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

import styles from './JoinSection.module.css';

interface JoinSectionProps {
  onJoin: () => void;
  onDiscord: () => void;
}

const highlights = [
  'Transparente Organisation mit demokratischem Rat',
  'Neu im Verse? Wir begleiten dich.',
  'Jeder ist Willkommen'
];

export function JoinSection({ onJoin, onDiscord }: JoinSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const onlineRef = useRef<HTMLSpanElement | null>(null);
  const voiceRef = useRef<HTMLSpanElement | null>(null);
  const { presenceCount, inVoice, isLoading } = useDiscordStats();

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -10%' });

  const handleHover = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion) {
        return;
      }

      anime.remove(event.currentTarget);
      anime({
        targets: event.currentTarget,
        scale: [1, 1.06],
        duration: 220,
        easing: 'easeOutCubic'
      });
    },
    [prefersReducedMotion]
  );

  const handleLeave = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion) {
        return;
      }

      anime.remove(event.currentTarget);
      anime({
        targets: event.currentTarget,
        scale: 1,
        duration: 200,
        easing: 'easeInOutCubic'
      });
    },
    [prefersReducedMotion]
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
      if (!prefersReducedMotion) {
        buttonPress(event.currentTarget);
      }
      action();
    },
    [prefersReducedMotion]
  );

  // Animated counters
  useAnimatedNumber(isLoading || presenceCount == null ? null : presenceCount, onlineRef);
  useAnimatedNumber(isLoading || inVoice == null ? null : inVoice, voiceRef);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="join">
      <div className="container">
        <SectionHeading
          eyebrow="Beitreten"
          title="Bereit?"
          description=""
        />
        <div className={styles.wrapper}>
          <article className={`${styles.card} glass-panel`} data-reveal-item>
            <ul className={styles.list}>
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button
                className="btn"
                type="button"
                onClick={(e) => handleClick(e, onJoin)}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                RSI Org besuchen
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={(e) => handleClick(e, onDiscord)}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                Discord Besuchen
              </button>
            </div>
            <div className={styles.stats} aria-label="Live Discord Status">
              <div className={styles.statBadge} data-type="online">
                <span className={styles.statLabel}>Online</span>
                <span className={styles.statValue} ref={onlineRef}>{(isLoading || presenceCount == null) ? '—' : presenceCount}</span>
              </div>
              <div className={styles.statBadge} data-type="voice">
                <span className={styles.statLabel}>Voice</span>
                <span className={styles.statValue} ref={voiceRef}>{(isLoading || inVoice == null) ? '—' : inVoice}</span>
              </div>
            </div>
            <p className={styles.note}>Wenn wir deine RSI-Anfrage nicht mitbekommen, einfach auf dem Discord melden.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
