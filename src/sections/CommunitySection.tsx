import { useMemo, useState } from 'react';
import { SectionHeading } from '@/components/SectionHeading';

import styles from './CommunitySection.module.css';

type EventCategory = 'irl' | 'ingame';
type EventStatus = 'upcoming' | 'past';

interface EventLink {
  label: string;
  href: string;
}

interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  description: string;
  links?: EventLink[];
}

const events: EventItem[] = [
  {
    id: 'bar-citizen-basel-2025',
    title: 'Bar Citizen Basel',
    category: 'irl',
    status: 'past',
    date: '01.06.2025',
    location: 'ManaBar Basel, Schweiz',
    image: '/images/Barcitizen_Basel_2025/Manabar.webp',
    description:
      'Wir haben 1 Abend vor dem Event 125 Anmeldungen für das Bar Citizen Basel erreicht!'
  },
  {
    id: 'citizencon-ebikon-2025',
    title: 'CitizenCon Direct Watch Party – Luzern/Ebikon',
    category: 'irl',
    status: 'upcoming',
    date: '26.10.2025',
    time: '20:30 – 23:00 (Bar Citizen 17:00 – 20:00)',
    location: 'Pathé Cinema Mall of Switzerland, Ebikon',
    image: '/images/CitizenCon_2025/Citizencon.webp',
    description:
      'Erlebe die CitizenCon Direct Watch Party live im Kinosaal mit Chris Roberts und Sandy Gardiner vor Ort! Cinematic Atmosphäre, Community-Vibes und Rahmenprogramm.',
    links: [
      { label: 'Website', href: 'https://example.com' },
      { label: 'Tickets', href: 'https://example.com/tickets' },
      { label: 'Spectrum', href: 'https://example.com/spectrum' },
      { label: 'Discord', href: 'https://discord.gg/jV8rByuJ4G' }
    ]
  },
  {
    id: 'op-ghost-run',
    title: 'OP: Ghost Run (Cargo & Escort)',
    category: 'ingame',
    status: 'past',
    date: '14.05.2955',
    image: '/images/ships/Ship.webp',
    description:
      'Lukrative Multi-Stop-Cargo-Route mit bewaffneter Eskorte. SOP-konformes Funk- und Formationsfliegen – WarBandLeads führten Squad & Logistik.'
  },
  {
    id: 'op-red-shield',
    title: 'OP: Red Shield (Combat Patrol)',
    category: 'ingame',
    status: 'upcoming',
    date: 'Nächste Woche',
    image: '/images/backgrounds/Jumpgate.webp',
    description:
      'Combat-Patrol in feindlichen Sektoren, ROE nach SOP. Slots für Recon, Fighter, Gunner und Logistik verfügbar.'
  }
];

function EventCard({ evt }: { evt: EventItem }) {
  const badge = evt.category === 'irl' ? 'Real-Life' : 'Ingame';
  return (
    <article className={styles.card}>
      <div className={styles.thumb} aria-hidden="true">
        <img src={evt.image || '/images/HSTC-Logo.webp'} alt="" loading="lazy" />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.meta}>
          <span className={styles.badge} data-kind={evt.category}>
            {badge}
          </span>
          <span className={styles.status} data-status={evt.status}>
            {evt.status === 'upcoming' ? 'Bevorstehend' : 'Vergangen'}
          </span>
        </div>
        <h3 className={styles.title}>{evt.title}</h3>
        <p className={styles.desc}>{evt.description}</p>
        <ul className={styles.details}>
          {evt.date && <li><strong>Datum:</strong> {evt.date}</li>}
          {evt.time && <li><strong>Zeit:</strong> {evt.time}</li>}
          {evt.location && <li><strong>Ort:</strong> {evt.location}</li>}
        </ul>
        {evt.links && evt.links.length > 0 && (
          <div className={styles.links}>
            {evt.links.map((l) => (
              <a key={l.href} href={l.href} className="btn btn-outline" target="_blank" rel="noreferrer noopener">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

const filters: Array<{ key: 'all' | EventCategory; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'irl', label: 'Real-Life' },
  { key: 'ingame', label: 'Ingame' }
];

export function CommunitySection() {
  const [activeFilter, setActiveFilter] = useState<'all' | EventCategory>('all');

  const { upcoming, past } = useMemo(() => {
    const byFilter = (e: EventItem) =>
      activeFilter === 'all' ? true : e.category === activeFilter;
    return {
      upcoming: events.filter((e) => e.status === 'upcoming' && byFilter(e)),
      past: events.filter((e) => e.status === 'past' && byFilter(e))
    };
  }, [activeFilter]);

  return (
    <section className="section" id="community">
      <div className="container">
        <SectionHeading
          eyebrow="Events"
          title="Bevorstehende & vergangene Events"
          description="Echte Treffen & Ingame-Operationen. Füge Bilder, Beschreibungen und Links hinzu – hier bleibt die Historie lebendig."
        />

        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={f.key === activeFilter ? `${styles.filterBtn} ${styles.active}` : styles.filterBtn}
              onClick={() => setActiveFilter(f.key)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        <h3 className={styles.subheading} id="events-upcoming">Bevorstehend</h3>
        <div className={styles.grid}>
          {upcoming.length === 0 && <p className={styles.empty}>Keine bevorstehenden Events für diesen Filter.</p>}
          {upcoming.map((evt) => (
            <EventCard key={evt.id} evt={evt} />
          ))}
        </div>

        <h3 className={styles.subheading} id="events-past">Vergangen</h3>
        <div className={styles.grid}>
          {past.length === 0 && <p className={styles.empty}>Noch keine vergangenen Events für diesen Filter.</p>}
          {past.map((evt) => (
            <EventCard key={evt.id} evt={evt} />
          ))}
        </div>
      </div>
    </section>
  );
}
