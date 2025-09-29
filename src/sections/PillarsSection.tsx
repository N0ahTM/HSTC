import { SectionHeading } from '@/components/SectionHeading';

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
  return (
    <section className={`section ${styles.section}`} id="mission">
      <div className="container">
        <SectionHeading
          eyebrow="Mission"
          title="Warum HSTC anders ist"
          description="Unsere Grundwerte verbinden professionelle Strukturen mit einer freundschaftlichen Community."
        />
        <div className={styles.cards}>
          {pillars.map((pillar) => (
            <article key={pillar.title} className={styles.card}>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
