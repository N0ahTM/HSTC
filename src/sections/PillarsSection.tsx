import { useEffect, useRef } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/motion/interactions';

import styles from './PillarsSection.module.css';

// Statisches Set der 6 Karten
const cards = [
  { title: 'Hauling', tagline: 'Warentransport & Handel', variant: 'hauling' },
  { title: 'Industrial Gameplay', tagline: 'Mining, Salvaging, Refining', variant: 'industrial' },
  { title: 'Exploring', tagline: 'Erforschen des Verse', variant: 'exploring' },
  { title: 'Mission Gameplay', tagline: 'Missionen & Events', variant: 'missions' },
  { title: 'Escort Gameplay', tagline: 'Escort & Security', variant: 'escort' },
  { title: 'FPS Action', tagline: 'Combat & Security', variant: 'fps' }
];

export function PillarsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -15%', delay: 110, once: true });

  // Optionaler 3D-Tilt-Effekt auf Desktop
  useEffect(() => {
    if (prefersReducedMotion || !cardsRef.current) return;
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;
    const items = Array.from(cardsRef.current.querySelectorAll<HTMLElement>('article'));
    const cleanups = items.map((el) => apply3DTilt(el, 6));
    return () => cleanups.forEach((fn) => fn());
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="mission">
      <div className="container">
        <SectionHeading eyebrow="Mission" title="Unser Portfolio" />
        <div ref={cardsRef} className={styles.cards} aria-label="HSTC Mission Grid">
          {cards.map((card) => (
            <article key={card.title} className={`${styles.card} ${styles[`card--${card.variant}`]}`} data-reveal-item>
              {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
