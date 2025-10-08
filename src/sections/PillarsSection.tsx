import { useEffect, useRef } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/motion/interactions';

import styles from './PillarsSection.module.css';

// Alle 6 Karten in einem gemeinsamen Grid
const cards = [
  {
    title: 'MACHTVOLLE DEMOKRATIE',
    description:
      'Kein Alleinherrscher – jedes Mitglied hat eine Stimme. Unser Verwaltungsrat trifft demokratisch Entscheidungen.',
    variant: 'demokratie'
  },
  {
    title: 'D/A/CH COMMUNITY',
    description:
      'Deutsche, Schweizer & Österreicher vereint unter einem Banner. Wir kommunizieren auf Deutsch.',
    variant: 'dach'
  },
  {
    title: 'ELITE OPERATIONEN',
    description:
      'Präzise Kampfeinsätze & lukrative Handelsmissionen – unsere WarBandLeads sorgen für Erfolg.',
    variant: 'elite'
  },
  {
    title: 'SICHERHEITSES­KORTEN',
    tagline: 'Wir schützen jede Handelsroute',
    description:
      'WarBand-Leads planen Eskorten mit abgestimmten Loadouts, Escape-Plänen und Echtzeit-Intel aus unserem Mobi-Glas-Netz.',
    variant: 'security'
  },
  {
    title: 'GALAXY LOGISTICS',
    tagline: 'Hochprofitabler Handel',
    description:
      'Koordinierte Lieferketten von Prospektoren bis zu Großfrachtern. Produktion, Raffinerie und Verkauf laufen über unsere abgestimmten Playbooks.',
    variant: 'logistics'
  },
  {
    title: 'RECON & EXPLORATION',
    tagline: 'Wir finden Chancen zuerst',
    description:
      'Aufklärungseinheiten scannen sichere Routen, Wracks und seltene Claims. Daten landen verschlüsselt in unserem Datenraum.',
    variant: 'recon'
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
          {cards.map((card) => (
            <article
              key={card.title}
              className={`${styles.card} ${styles[`card--${card.variant}`]}`}
              data-reveal-item
            >
              {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
