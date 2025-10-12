import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
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

const PREVIEW_LIMIT: Record<EventStatus, number> = {
  upcoming: 4,
  past: 6
};

const EVENTS: EventItem[] = [
  {
    id: 'bar-citizen-zurich-2026',
    title: 'Bar Citizen Zurich',
    category: 'irl',
    status: 'upcoming',
    date: '15.02.2026',
    time: '18:30 - 23:30',
    location: 'Karl der Grosse Kulturzentrum, Zurich, Switzerland',
    image: '/images/backgrounds/Planet_3.webp',
    description:
      'After-work Meetup mit Entwickler-Talk, Holovideo-Recaps und Community-Spotlights in lockerer Lounge-Atmosphäre.',
    links: [
      { label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' },
      { label: 'Warteliste', href: 'https://example.com/rsvp-zurich' }
    ]
  },
  {
    id: 'bar-citizen-vienna-2026',
    title: 'Bar Citizen Vienna',
    category: 'irl',
    status: 'upcoming',
    date: '21.03.2026',
    time: '17:00 - 23:00',
    location: 'Roberto American Bar, Vienna, Austria',
    image: '/images/backgrounds/Planet_2.webp',
    description:
      'Austrian Outpost Special: Tasting-Session, Merch Swap und gemeinsamer Livestream der jüngsten Spectrum-News.',
    links: [{ label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }]
  },
  {
    id: 'citizencon-watch-frankfurt-2956',
    title: 'CitizenCon Watch Party Frankfurt',
    category: 'irl',
    status: 'upcoming',
    date: '10.10.2956',
    time: '18:00 - 01:00',
    location: 'Astor Film Lounge, Frankfurt, Germany',
    image: '/images/CitizenCon_2025/Citizencon.webp',
    description:
      'Kinosaal mit 4K-Projektion, Community-Panel, Giveaways und Late-Night-Snacks – alles rund um CitizenCon live.',
    links: [
      { label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' },
      { label: 'Ticket Anfrage', href: 'https://example.com/citizencon-frankfurt' }
    ]
  },
  {
    id: 'op-red-shield-2956',
    title: 'OP: Red Shield (Combat Patrol)',
    category: 'ingame',
    status: 'upcoming',
    date: '26.10.2956',
    time: '20:00 UEE',
    location: 'ArcCorp Orbit, Stanton',
    image: '/images/backgrounds/Jumpgate.webp',
    description:
      'Staffel-Patrouille entlang der Lagrange-Points. Fokus auf Formationsflug, Zielübergaben und Live-Fire Drill.',
    links: [{ label: 'Mission Briefing', href: 'https://example.com/op-red-shield' }]
  },
  {
    id: 'op-ghost-run-2956',
    title: 'OP: Ghost Run (Cargo & Escort)',
    category: 'ingame',
    status: 'upcoming',
    date: '02.11.2956',
    time: '19:30 UEE',
    location: 'microTech Cargo Hub, Stanton',
    image: '/images/ships/Hull_C.webp',
    description:
      'Multi-Stop-Lieferung mit gesicherten Handelsrouten. Bedarf an Haulern, Logistik-Koordination und E-Warfare Escort.',
    links: [{ label: 'Flightplan', href: 'https://example.com/ghost-run' }]
  },
  {
    id: 'rescue-scenario-drill-2956',
    title: 'Rescue Scenario Drill',
    category: 'ingame',
    status: 'upcoming',
    date: '09.11.2956',
    time: '20:00 UEE',
    location: 'Crusader Orbit, Stanton',
    image: '/images/ships/Terrapin.webp',
    description:
      'Medical Response Simulation mit Search & Rescue Terrapins, Medrunner-Kooperation und koordinierter Funkdisziplin.',
    links: [{ label: 'Teilnahme sichern', href: 'https://example.com/rescue-drill' }]
  },
  {
    id: 'bar-citizen-basel-2025',
    title: 'Bar Citizen Basel',
    category: 'irl',
    status: 'past',
    date: '01.06.2025',
    location: 'ManaBar Basel, Switzerland',
    image: '/images/Barcitizen_Basel_2025/Manabar.webp',
    description:
      'Über 60 Citizens feierten bei Arcade-Games und Community-Panels – inklusive Live-Verlosung exklusiver Ship Paints.',
    links: [{ label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }]
  },
  {
    id: 'citizencon-ebikon-2025',
    title: 'CitizenCon Direct Watch Party - Luzern/Ebikon',
    category: 'irl',
    status: 'past',
    date: '11.10.2025',
    time: '20:30 - 23:00 (Bar Citizen 17:00 - 20:00)',
    location: 'Pathé Cinema Mall of Switzerland, Ebikon',
    image: '/images/CitizenCon_2025/Citizencon.webp',
    description:
      'Volle Kinoleinwand, Stimmungsfeuerwerk und Live-Kommentare der HSTC-Crew zu allen CitizenCon-Enthüllungen.',
    links: [{ label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }]
  },
  {
    id: 'op-ghost-run-2955',
    title: 'OP: Ghost Run (Cargo & Escort)',
    category: 'ingame',
    status: 'past',
    date: '14.05.2955',
    time: '20:00 UEE',
    location: 'Orison Freight Yard, Crusader',
    image: '/images/ships/Ship.webp',
    description:
      'Logistikroute mit Shadow-Freelancern, koordinierter Quantum-Break und aggressiver ECM-Eskorte im Stanton-Netz.',
    links: [{ label: 'Debrief ansehen', href: 'https://example.com/debrief-ghost-run' }]
  },
  {
    id: 'academy-flight-night-2955',
    title: 'Academy Flight Night',
    category: 'ingame',
    status: 'past',
    date: '22.06.2955',
    time: '21:00 UEE',
    location: 'Everus Harbor, Hurston',
    image: '/images/ships/Carrack.webp',
    description:
      'Trainingsabend mit Fokus auf Landeanflüge, Staffelwechsel und Notfall-Prozeduren. Drei neue Flight Leads zertifiziert.',
    links: [{ label: 'Briefing Slides', href: 'https://example.com/academy-flight-night' }]
  },
  {
    id: 'cargo-convoy-aurora-2954',
    title: 'Cargo Convoy Aurora',
    category: 'ingame',
    status: 'past',
    date: '03.11.2954',
    time: '19:45 UEE',
    location: 'Port Tressler, microTech',
    image: '/images/ships/Reclaimer.webp',
    description:
      'Mehrstufiger Frachter-Konvoi mit Live-Wetterauswertung und eingesetzter Reclaimer-Salvage-Unterstützung.',
    links: [{ label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }]
  },
  {
    id: 'rescue-response-sim-2955',
    title: 'Rescue Response Simulation',
    category: 'ingame',
    status: 'past',
    date: '18.08.2955',
    time: '20:15 UEE',
    location: 'Ambulance Grid, Area18',
    image: '/images/ships/Terrapin.webp',
    description:
      'Kooperative Rettungsmission mit Medrunner-Teams, koordinierter Drop-Pod Landung und Evakuierung unter Zeitdruck.',
    links: [{ label: 'Mission Log', href: 'https://example.com/rescue-sim' }]
  },
  {
    id: 'fleet-week-meetup-2955',
    title: 'Fleet Week Meetup',
    category: 'irl',
    status: 'past',
    date: '27.05.2025',
    time: '14:00 - 20:00',
    location: 'Imperial War Museum, Manchester, UK',
    image: '/images/backgrounds/Pyro.webp',
    description:
      'Guided Tour, Lore-Quiz und Community-Fotoshooting zum Launch der Fleet Week. Abschluss im Museumscafé.',
    links: [{ label: 'Galerie', href: 'https://example.com/fleet-week-gallery' }]
  },
  {
    id: 'pyro-expedition-2955',
    title: 'Pyro Expedition Recon',
    category: 'ingame',
    status: 'past',
    date: '12.09.2955',
    time: '19:00 UEE',
    location: 'Pyro Jump Point, Stanton',
    image: '/images/backgrounds/Explosion.webp',
    description:
      'Langstreckenaufklärung in Pyro mit Zollpunkt-Scans, Fuel Chain und Expeditionstagebuch. Drei neue Jump Data Sets.',
    links: [{ label: 'Missionsvideo', href: 'https://example.com/pyro-expedition' }]
  },
  {
    id: 'bar-citizen-linz-2025',
    title: 'Bar Citizen Linz',
    category: 'irl',
    status: 'past',
    date: '19.07.2025',
    time: '19:00 - 23:00',
    location: 'Sky Garden, Linz, Austria',
    image: '/images/backgrounds/Planet.webp',
    description:
      'Sommerlicher Rooftop-Hangout mit Sunset-BBQ, Ship-Paint-Tauschbörse und spontanen Spectrum-Live-Podcasts.',
    links: [{ label: 'Event Discord', href: 'https://discord.gg/wg7UY59T' }]
  }
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
  const [isModalOpen, setModalOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { filteredEvents, buckets } = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? EVENTS
        : EVENTS.filter((event) => event.category === activeFilter);

    return { filteredEvents: filtered, buckets: bucketEvents(filtered) };
  }, [activeFilter]);

  const featuredEvent = useMemo(() => {
    if (buckets.upcoming.length > 0) {
      return buckets.upcoming[0];
    }
    if (buckets.past.length > 0) {
      return buckets.past[0];
    }
    return undefined;
  }, [buckets]);

  const upcomingTail = useMemo(() => {
    if (!featuredEvent || featuredEvent.status !== 'upcoming') {
      return buckets.upcoming;
    }
    return buckets.upcoming.slice(1);
  }, [buckets.upcoming, featuredEvent]);

  const pastPool = useMemo(() => {
    if (featuredEvent?.status === 'past') {
      return buckets.past.slice(1);
    }
    return buckets.past;
  }, [buckets.past, featuredEvent]);

  const upcomingPreview = upcomingTail.slice(0, PREVIEW_LIMIT.upcoming);
  const pastPreview = pastPool.slice(0, PREVIEW_LIMIT.past);
  const upcomingExtraCount = Math.max(upcomingTail.length - upcomingPreview.length, 0);
  const pastExtraCount = Math.max(pastPool.length - pastPreview.length, 0);

  const hasAnyEvents = filteredEvents.length > 0;
  const animationEnabled = !prefersReducedMotion;

  useStaggerReveal(containerRef);

  useEffect(() => {
    if (!isModalOpen || typeof document === 'undefined') {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeypress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeypress);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeypress);
    };
  }, [isModalOpen]);

  const handleModalToggle = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <section className="section" id="community" data-animate={animationEnabled ? 'on' : 'off'}>
      <div className="container" ref={containerRef}>
        <SectionHeading eyebrow="Events" title="Events" description="Ingame und Real-Life" />

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

        {!hasAnyEvents ? (
          <p className={styles.emptyState}>
            Derzeit sind keine Events im ausgewählten Filter hinterlegt.
          </p>
        ) : (
          <div className={styles.layout}>
            {featuredEvent && (
              <section className={styles.featuredSection} aria-label="Highlight Event">
                <h3 className={styles.sectionLabel}>Highlight</h3>
                <FeaturedEventCard event={featuredEvent} animate={animationEnabled} />
                {hasAnyEvents && (
                  <div className={styles.featuredFooter}>
                    <button type="button" className={styles.viewAllBtn} onClick={handleModalToggle}>
                      Alle Events anzeigen
                    </button>
                  </div>
                )}
              </section>
            )}

            <section className={styles.carouselSection} aria-label="Bevorstehende Events">
              <header className={styles.sectionHeader}>
                <h3 className={styles.subheading}>Bevorstehend</h3>
                <p className={styles.sectionLead}>
                  Kompakte Übersicht mit Fokus auf Slots, Startzeiten und Spots zum Mitmachen.
                </p>
              </header>
              {upcomingPreview.length > 0 ? (
                <EventCarousel
                  events={upcomingPreview}
                  animationEnabled={animationEnabled}
                  variant="upcoming"
                  totalCount={upcomingTail.length}
                  limit={PREVIEW_LIMIT.upcoming}
                />
              ) : featuredEvent?.status !== 'upcoming' ? (
                <p className={styles.empty}>Keine bevorstehenden Events für diesen Filter.</p>
              ) : null}
              {upcomingExtraCount > 0 && (
                <p className={styles.moreHint}>+{upcomingExtraCount} weitere Events im Modal</p>
              )}
            </section>

            <section className={styles.carouselSection} aria-label="Vergangene Events">
              <header className={styles.sectionHeader}>
                <h3 className={styles.subheading}>Vergangen</h3>
                <p className={styles.sectionLead}>
                  Rückblick auf unsere letzten IRL-Treffen und Operationen im Verse.
                </p>
              </header>
              {pastPreview.length > 0 ? (
                <EventCarousel
                  events={pastPreview}
                  animationEnabled={animationEnabled}
                  variant="past"
                  totalCount={pastPool.length}
                  limit={PREVIEW_LIMIT.past}
                />
              ) : featuredEvent?.status === 'past' ? null : (
                <p className={styles.empty}>Noch keine vergangenen Events für diesen Filter.</p>
              )}
              {pastExtraCount > 0 && (
                <p className={styles.moreHint}>+{pastExtraCount} weitere Events im Modal</p>
              )}
            </section>
          </div>
        )}
      </div>

      {isModalOpen && (
        <EventModal events={filteredEvents} onClose={handleModalClose} animationEnabled={animationEnabled} />
      )}
    </section>
  );
}

interface FeaturedEventCardProps {
  event: EventItem;
  animate: boolean;
}

function FeaturedEventCard({ event, animate }: FeaturedEventCardProps) {
  const details = [
    { label: 'Datum', value: event.date },
    { label: 'Zeit', value: event.time },
    { label: 'Ort', value: event.location }
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  const cardStyle = animate ? ({ '--card-delay': '0s' } as CSSProperties) : undefined;

  return (
    <article className={styles.featuredCard} data-status={event.status} style={cardStyle}>
      <div className={styles.featuredMedia} aria-hidden="true">
        <img src={event.image ?? '/images/HSTC-Logo.webp'} alt="" loading="lazy" />
      </div>
      <div className={styles.featuredContent}>
        <div className={styles.meta}>
          <span className={styles.badge} data-kind={event.category}>
            {EVENT_CATEGORIES[event.category]}
          </span>
          <span className={styles.status} data-status={event.status}>
            {event.status === 'upcoming' ? 'Bevorstehend' : 'Vergangen'}
          </span>
        </div>
        <h3 className={styles.featuredTitle}>{event.title}</h3>
        <p className={styles.featuredDesc}>{event.description}</p>
        {details.length > 0 && (
          <dl className={styles.featuredDetails}>
            {details.map((detail) => (
              <div key={detail.label} className={styles.detailRow}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {event.links && event.links.length > 0 && (
          <div className={styles.featuredActions}>
            {event.links.map((link, index) => (
              <a
                key={`${event.id}-${link.href}`}
                href={link.href}
                className={
                  index === 0
                    ? `${styles.primaryLink} btn btn-outline btn-sm`
                    : `${styles.secondaryLink} btn btn-outline btn-sm`
                }
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

interface EventCarouselProps {
  events: EventItem[];
  animationEnabled: boolean;
  variant: EventStatus;
  totalCount: number;
  limit: number;
}

function EventCarousel({ events, animationEnabled, variant, totalCount, limit }: EventCarouselProps) {
  if (events.length === 0) {
    return null;
  }

  const hasOverflow = totalCount > limit;

  return (
    <div
      className={styles.carouselShell}
      data-variant={variant}
      data-overflow={hasOverflow ? 'true' : 'false'}
    >
      <div className={styles.carousel} role="list">
        {events.map((event, index) => (
          <CarouselCard
            key={event.id}
            event={event}
            index={index}
            animate={animationEnabled}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

interface CarouselCardProps {
  event: EventItem;
  index: number;
  animate: boolean;
  variant: EventStatus;
}

function CarouselCard({ event, index, animate, variant }: CarouselCardProps) {
  const details = [
    { label: 'Datum', value: event.date },
    { label: 'Zeit', value: event.time },
    { label: 'Ort', value: event.location }
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  const delay = animate ? `${(index + 1) * 0.06}s` : undefined;
  const cardStyle = animate ? ({ '--card-delay': delay } as CSSProperties) : undefined;

  return (
    <article
      className={styles.carouselCard}
      role="listitem"
      data-status={variant}
      style={cardStyle}
    >
      <div className={styles.meta}>
        <span className={styles.badge} data-kind={event.category}>
          {EVENT_CATEGORIES[event.category]}
        </span>
        <span className={styles.status} data-status={event.status}>
          {event.status === 'upcoming' ? 'Bevorstehend' : 'Vergangen'}
        </span>
      </div>
      <h4 className={styles.carouselTitle}>{event.title}</h4>
      <div className={styles.carouselMeta}>
        {details.map((detail) => (
          <span key={detail.label}>{detail.value}</span>
        ))}
      </div>
      <p className={styles.carouselDesc}>{event.description}</p>
      {event.links && event.links.length > 0 && (
        <div className={styles.carouselActions}>
          {event.links.slice(0, 1).map((link) => (
            <a
              key={`${event.id}-${link.href}`}
              href={link.href}
              className={`${styles.primaryLink} btn btn-outline btn-sm`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

interface EventModalProps {
  events: EventItem[];
  onClose: () => void;
  animationEnabled: boolean;
}

function EventModal({ events, onClose, animationEnabled }: EventModalProps) {
  if (events.length === 0) {
    return null;
  }

  const modalBuckets = bucketEvents(events);

  const handleBackdropClick = () => onClose();
  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className={styles.modalCard} onClick={handleContentClick}>
        <header className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>Event Übersicht</p>
            <h3 className={styles.modalTitle}>Alle Events im aktuellen Filter</h3>
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Modal schließen">
            Schließen
          </button>
        </header>
        <div className={styles.modalBody}>
          {modalBuckets.upcoming.length > 0 && (
            <div className={styles.modalSection}>
              <h4 className={styles.modalSubheading}>Bevorstehend</h4>
              <EventGrid events={modalBuckets.upcoming} animationEnabled={animationEnabled} />
            </div>
          )}
          {modalBuckets.past.length > 0 && (
            <div className={styles.modalSection}>
              <h4 className={styles.modalSubheading}>Vergangen</h4>
              <EventGrid events={modalBuckets.past} animationEnabled={animationEnabled} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EventGridProps {
  events: EventItem[];
  animationEnabled: boolean;
}

function EventGrid({ events, animationEnabled }: EventGridProps) {
  return (
    <ul className={styles.modalGrid} role="list">
      {events.map((event, index) => (
        <li key={event.id} className={styles.modalGridItem}>
          <EventCard event={event} index={index} animate={animationEnabled} />
        </li>
      ))}
    </ul>
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

  const delay = animate ? `${index * 0.04}s` : undefined;
  const cardStyle = animate ? ({ '--card-delay': delay } as CSSProperties) : undefined;

  return (
    <article className={styles.card} data-status={event.status} style={cardStyle}>
      <div className={styles.cardMedia} aria-hidden="true">
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
        <h4 className={styles.cardTitle}>{event.title}</h4>
        <p className={styles.cardDesc}>{event.description}</p>
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
                key={`${event.id}-${link.href}`}
                href={link.href}
                className={`${styles.secondaryLink} btn btn-outline btn-sm`}
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
