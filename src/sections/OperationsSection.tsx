import { useRef } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';

import styles from './OperationsSection.module.css';

const operations = [
  {
    icon: '🛡️',
    title: 'Sicherheitseskorten',
    tagline: 'Wir schützen jede Handelsroute',
    description:
      'WarBand-Leads planen Eskorten mit abgestimmten Loadouts, Escape-Plänen und Echtzeit-Intel aus unserem Mobi-Glas-Netz.'
  },
  {
    icon: '🚀',
    title: 'Galaxy Logistics',
    tagline: 'Hochprofitabler Handel',
    description:
      'Koordinierte Lieferketten von Prospektoren bis zu Großfrachtern. Produktion, Raffinerie und Verkauf laufen über unsere abgestimmten Playbooks.'
  },
  {
    icon: '🛰️',
    title: 'Recon & Exploration',
    tagline: 'Wir finden Chancen zuerst',
    description:
      'Aufklärungseinheiten scannen sichere Routen, Wracks und seltene Claims. Daten landen verschlüsselt in unserem Datenraum.'
  }
];

export function OperationsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -12%' });

  return (
    <section ref={sectionRef} className="section" id="operations">
      <div className="container">
        <SectionHeading
          eyebrow="Spezialisierungen"
          title="Operationen, die den Unterschied machen"
          description="Vom schnellen Response-Team bis zur Handelsflotte – HSTC deckt alle Szenarien mit erprobten SOPs ab."
        />
        <div className={styles.grid}>
          {operations.map((operation) => (
            <article key={operation.title} className={styles.card} data-reveal-item>
              <span aria-hidden="true" className={styles.icon}>
                {operation.icon}
              </span>
              <div className={styles.meta}>
                <span className={styles.tagline}>{operation.tagline}</span>
              </div>
              <h3>{operation.title}</h3>
              <p>{operation.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
