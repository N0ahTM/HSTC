import { SectionHeading } from '@/components/SectionHeading';

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
  return (
    <section className={`section ${styles.section}`} id="join">
      <div className="container">
        <SectionHeading
          eyebrow="Beitreten"
          title="Bereit für den Hangar?"
          description="Starte über unser RSI-Profil und sichere dir deinen Platz im Discord. Unser Recruit-Team begleitet dich durch den gesamten Prozess."
        />
        <div className={styles.wrapper}>
          <article className={`${styles.card} glass-panel`}>
            <ul className={styles.list}>
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button className="btn" type="button" onClick={onJoin}>
                RSI Org besuchen
              </button>
              <button className="btn btn-outline" type="button" onClick={onDiscord}>
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
