import { useCallback, useRef, type MouseEvent } from 'react';
import anime from 'animejs';

import { SectionHeading } from '@/components/SectionHeading';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { buttonPress } from '@/motion/interactions';

import styles from './JoinSection.module.css';

interface JoinSectionProps {
  onJoin: () => void;
  onDiscord: () => void;
}

const highlights = [
  'Bewährte Einsatz- & Handelspläne für jede WarBand',
  'Academy-Trainings für neue Piloten & Specialists',
  'Transparente Organisation mit demokratischem Rat'
];

export function JoinSection({ onJoin, onDiscord }: JoinSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="join">
      <div className="container">
        <SectionHeading
          eyebrow="Beitreten"
          title="Bereit für den Hangar?"
          description="Starte über unser RSI-Profil und sichere dir deinen Platz im Discord. Unser Recruit-Team begleitet dich durch den gesamten Prozess."
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
                Discord öffnen
              </button>
            </div>
            <p className={styles.note}>Antwort vom Recruit-Team innerhalb von 24 Stunden.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
