import { useMemo, useRef, useState } from 'react';
// import type { CSSProperties } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';

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

type EventBuckets = Record<EventStatus, EventItem[]>;

const EVENT_CATEGORIES: Record<EventCategory, string> = {
  irl: 'Real-Life',
  ingame: 'Ingame'
};

const FILTERS: Array<{ key: 'all' | EventCategory; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'irl', label: 'Real-Life' },
  { key: 'ingame', label: 'Ingame' }
];

const EVENTS: EventItem[] = [
  {
    id: 'bar-citizen-basel-2025',
    title: 'Bar Citizen Basel',
    category: 'irl',
    status: 'past',
    date: '01.06.2025',
    location: 'ManaBar Basel, Schweiz',
    image: '/images/Barcitizen_Basel_2025/Manabar.webp',
    description:
      '',
    links: [
      { label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }
    ]
  },
  {
    id: 'citizencon-ebikon-2025',
    title: 'CitizenCon Direct Watch Party – Luzern/Ebikon',
    category: 'irl',
    status: 'past',
    date: '11.10.2025',
    time: '20:30 – 23:00 (Bar Citizen 17:00 – 20:00)',
    location: 'Pathé Cinema Mall of Switzerland, Ebikon',
    image: '/images/CitizenCon_2025/Citizencon.webp',
    description:
      '',
    links: [
      { label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }
    ]
  }
  // {
  //   id: 'op-ghost-run',
  //   title: 'OP: Ghost Run (Cargo & Escort)',
  //   category: 'ingame',
  //   status: 'past',
  //   date: '14.05.2955',
  //   image: '/images/ships/Ship.webp',
  //   description:
  //     'Lukrative Multi-Stop-Cargo-Route mit bewaffneter Eskorte. SOP-konformes Funk- und Formationsfliegen – WarBandLeads führten Squad & Logistik.'
  // },
  // {
  //   id: 'op-red-shield',
  //   title: 'OP: Red Shield (Combat Patrol)',
  //   category: 'ingame',
  //   status: 'upcoming',
  //   date: 'Nächste Woche',
  //   image: '/images/backgrounds/Jumpgate.webp',
  //   description:
  //     'Combat-Patrol in feindlichen Sektoren, ROE nach SOP. Slots für Recon, Fighter, Gunner und Logistik verfügbar.'
  // }
];

function bucketEvents(events: EventItem[]): EventBuckets {
  return events.reduce<EventBuckets>(
    (acc, event) => {
      acc[event.status].push(event);
      return acc;
    },
    { upcoming: [], past: [] }
  );
}

export function CommunitySection() {
  const [activeFilter, setActiveFilter] = useState<'all' | EventCategory>('all');
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const buckets = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? EVENTS
        : EVENTS.filter((event) => event.category === activeFilter);

    return bucketEvents(filtered);
  }, [activeFilter]);

  const animationEnabled = !prefersReducedMotion;
  // Trigger stagger reveal so that the heading fades in; without this the CSS keeps it at opacity:0
  // Keep hook rules: call inside effect rather than conditionally in render.
  useStaggerReveal(containerRef);

  return (
    <section className="section" id="community" data-animate={animationEnabled ? 'on' : 'off'}>
  <div className="container" ref={containerRef}>
        <SectionHeading
          eyebrow="Events"
          title="Events"
          description="Ingame und Real-Life"
        />

        <div role="group" aria-label="Event-Kategorien" className={styles.filters}>
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <button
                key={filter.key}
                type="button"
                className={isActive ? `${styles.filterBtn} ${styles.isActive}` : styles.filterBtn}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <EventGroup
          title="Bevorstehend"
          emptyMessage="Keine bevorstehenden Events für diesen Filter."
          events={buckets.upcoming}
          animationEnabled={animationEnabled}
        />
        <EventGroup
          title="Vergangen"
          emptyMessage="Noch keine vergangenen Events für diesen Filter."
          events={buckets.past}
          animationEnabled={animationEnabled}
        />
      </div>
    </section>
  );
}

interface EventGroupProps {
  title: string;
  emptyMessage: string;
  events: EventItem[];
  animationEnabled: boolean;
}

function EventGroup({ title, emptyMessage, events, animationEnabled }: EventGroupProps) {
  const hasEvents = events.length > 0;

  return (
    <div className={styles.group}>
      <h3 className={styles.subheading}>{title}</h3>
      {hasEvents ? (
        <ul className={styles.grid} role="list">
          {events.map((event, index) => (
            <li key={event.id} className={styles.gridItem}>
              <EventCard event={event} index={index} animate={animationEnabled} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </div>
  );
}

interface EventCardProps {
  event: EventItem;
  index: number;
  animate: boolean;
}

function EventCard({ event, index, animate }: EventCardProps) {
  const details = [
    { label: 'Datum', value: event.date },
    { label: 'Zeit', value: event.time },
    { label: 'Ort', value: event.location }
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  const dataDelay = animate ? (index * 0.08).toFixed(2) + 's' : undefined;
  return (
    <article className={styles.card} data-status={event.status} data-delay={dataDelay}>
      <div className={styles.thumb} aria-hidden="true">
        <img src={event.image ?? '/images/HSTC-Logo.webp'} alt="" loading="lazy" />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.meta}>
          <span className={styles.badge} data-kind={event.category}>
            {EVENT_CATEGORIES[event.category]}
          </span>
          <span className={styles.status} data-status={event.status}>
            {event.status === 'upcoming' ? 'Bevorstehend' : 'Vergangen'}
          </span>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.desc}>{event.description}</p>
        {details.length > 0 && (
          <dl className={styles.details}>
            {details.map((detail) => (
              <div key={detail.label} className={styles.detailRow}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {event.links && event.links.length > 0 && (
          <div className={styles.links}>
            {event.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="btn btn-outline btn-sm"
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}





