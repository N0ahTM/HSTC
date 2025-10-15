import { useMemo, useRef } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { useDiscordEvents, type DiscordCommunityEvent } from '@/hooks/useDiscordEvents';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';

import styles from './CommunitySection.module.css';

type DisplayStatus = 'active' | 'upcoming' | 'past';

interface DisplayEvent {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  timeLabel?: string;
  location?: string;
  imageUrl?: string;
  status: DisplayStatus;
  typeLabel: string;
  url?: string;
  startTime: number;
}

const FALLBACK_DESCRIPTION = 'Keine Beschreibung verfuegbar.';
const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit'
});
const stampFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function mapStatus(event: DiscordCommunityEvent): DisplayStatus {
  if (event.isActive) {
    return 'active';
  }
  return event.isPast ? 'past' : 'upcoming';
}

function mapTypeLabel(event: DiscordCommunityEvent): string {
  switch (event.type) {
    case 'EXTERNAL':
      return 'Community';
    case 'VOICE':
      return 'Voice';
    case 'STAGE':
      return 'Stage';
    default:
      return 'Ingame';
  }
}

function formatDateLabel(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatTimeRange(startIso: string, endIso?: string): string | undefined {
  try {
    const start = timeFormatter.format(new Date(startIso));
    if (!endIso) {
      return start;
    }
    const end = timeFormatter.format(new Date(endIso));
    return `${start} - ${end}`;
  } catch {
    return undefined;
  }
}

function createDisplayEvent(event: DiscordCommunityEvent, guildId?: string): DisplayEvent {
  const status = mapStatus(event);
  const typeLabel = mapTypeLabel(event);
  const dateLabel = formatDateLabel(event.startsAt);
  const timeLabel = formatTimeRange(event.startsAt, event.endsAt);
  const url = guildId ? `https://discord.com/events/${guildId}/${event.id}` : undefined;

  return {
    id: event.id,
    title: event.name,
    description: event.description?.trim() || FALLBACK_DESCRIPTION,
    dateLabel,
    timeLabel,
    location: event.location,
    imageUrl: event.imageUrl,
    status,
    typeLabel,
    url,
    startTime: Date.parse(event.startsAt)
  };
}

function EventCard({ event }: { event: DisplayEvent }) {
  const statusLabel = event.status === 'active' ? 'Aktiv' : event.status === 'upcoming' ? 'Bevorstehend' : 'Vergangen';

  return (
    <article className={styles.card} data-status={event.status}>
      {event.imageUrl && (
        <div className={styles.cardMedia} aria-hidden="true">
          <img src={event.imageUrl} alt="" loading="lazy" />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardBadges}>
          <span className={styles.badge} data-variant={event.status}>
            {statusLabel}
          </span>
          <span className={styles.badgeSecondary}>{event.typeLabel}</span>
        </div>
        <h4 className={styles.cardTitle}>{event.title}</h4>
        <p className={styles.cardDescription}>{event.description}</p>
        <dl className={styles.cardMeta}>
          <div>
            <dt>Datum</dt>
            <dd>{event.dateLabel}</dd>
          </div>
          {event.timeLabel && (
            <div>
              <dt>Zeit</dt>
              <dd>{event.timeLabel}</dd>
            </div>
          )}
          {event.location && (
            <div>
              <dt>Ort</dt>
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
        <div className={styles.cardActions}>
          {event.url && (
            <a
              className="btn btn-outline btn-sm"
              href={event.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              Event im Discord
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function CommunitySection() {
  const {
    active,
    upcoming,
    past,
    loading,
    error,
    refresh,
    metaCache,
    generatedAt,
    guildId,
    totalCount
  } = useDiscordEvents();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useStaggerReveal(containerRef, { rootMargin: '0px 0px -15%' });

  const upcomingEvents = useMemo(() => {
    const list = [...active, ...upcoming].map((event) => createDisplayEvent(event, guildId));
    return list.sort((a, b) => a.startTime - b.startTime);
  }, [active, upcoming, guildId]);

  const pastEvents = useMemo(() => {
    const list = past.map((event) => createDisplayEvent(event, guildId));
    return list.sort((a, b) => b.startTime - a.startTime);
  }, [past, guildId]);

  const loadedAny = upcomingEvents.length > 0 || pastEvents.length > 0;
  const isInitialLoading = loading && !loadedAny;
  const generatedLabel = generatedAt ? stampFormatter.format(new Date(generatedAt)) : undefined;

  return (
    <section className={`section ${styles.section}`} id="community">
      <div className="container" ref={containerRef}>
        <SectionHeading eyebrow="Events" title="Events" description="Ingame und Real-Life" />

        <div className={styles.statusBar}>
          <div className={styles.statusChips}>
            <span className={styles.statusChip}>Aktive Events: {active.length}</span>
            <span className={styles.statusChip}>Bevorstehend: {upcoming.length}</span>
            <span className={styles.statusChip}>Vergangen: {past.length}</span>
            {typeof totalCount === 'number' && (
              <span className={styles.statusChip}>Gesamt: {totalCount}</span>
            )}
            {metaCache && <span className={styles.metaTag}>Cache: {metaCache}</span>}
            {generatedLabel && <span className={styles.metaTag}>Stand: {generatedLabel}</span>}
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void refresh()}>
            Aktualisieren
          </button>
        </div>

        {isInitialLoading && <p className={styles.notice}>Events werden geladen...</p>}
        {error && !isInitialLoading && (
          <p className={`${styles.notice} ${styles.errorNotice}`}>{error}</p>
        )}

        {!isInitialLoading && !loadedAny ? (
          <div className={styles.emptyState}>
            <p>
              Derzeit sind keine Events geplant. Schau spaeter noch einmal vorbei oder tritt dem Discord bei, um
              Benachrichtigungen zu erhalten.
            </p>
          </div>
        ) : (
          <>
            {upcomingEvents.length > 0 && (
              <section className={styles.group} aria-label="Aktive und kommende Events">
                <header className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>Aktiv und bevorstehend</h3>
                  <span className={styles.groupCount}>{upcomingEvents.length}</span>
                </header>
                <div className={styles.grid}>
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section className={styles.group} aria-label="Vergangene Events">
                <header className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>Vergangene Events</h3>
                  <span className={styles.groupCount}>{pastEvents.length}</span>
                </header>
                <div className={`${styles.grid} ${styles.pastGrid}`}>
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
}
