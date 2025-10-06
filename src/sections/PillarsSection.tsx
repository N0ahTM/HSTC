import { useEffect, useRef } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/motion/interactions';

import styles from './PillarsSection.module.css';

const pillars = [
  {
    title: 'MACHTVOLLE DEMOKRATIE',
    description:
      'Kein Alleinherrscher – jedes Mitglied hat eine Stimme. Unser Verwaltungsrat trifft demokratisch Entscheidungen.'
  },
  {
    title: 'D/A/CH COMMUNITY',
    description:
      'Deutsche, Schweizer & Österreicher vereint unter einem Banner. Wir kommunizieren auf Deutsch.'
  },
  {
    title: 'ELITE OPERATIONEN',
    description:
      'Präzise Kampfeinsätze & lukrative Handelsmissionen – unsere WarBandLeads sorgen für Erfolg.'
  }
];

export function PillarsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -15%', delay: 110 });

  useEffect(() => {
    if (prefersReducedMotion || !cardsRef.current) return;
    
    // Only apply on desktop (pointer: fine)
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    const cards = Array.from(cardsRef.current.querySelectorAll<HTMLElement>('article'));
    const cleanups = cards.map((card) => apply3DTilt(card, 6));

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="mission">
      <div className="container">
        <SectionHeading
          eyebrow="Mission"
          title="Warum HSTC anders ist"
          description="Unsere Grundwerte verbinden professionelle Strukturen mit einer freundschaftlichen Community."
        />
        <div ref={cardsRef} className={styles.cards}>
          {pillars.map((pillar) => (
            <article key={pillar.title} className={styles.card} data-reveal-item>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
