import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { SectionHeading } from '@/components/SectionHeading';
import { useDiscordChannelImages, type DiscordChannelImage } from '@/hooks/useDiscordChannelImages';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';

import styles from './CommunityImagesSection.module.css';

interface ScrollControlsState {
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

function formatUploadedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CommunityImagesSection() {
  const { images, loading, error, hasMore, isFetchingMore, fetchNext, retry } = useDiscordChannelImages(20);
  const prefersReducedMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [controlsState, setControlsState] = useState<ScrollControlsState>({ canScrollPrev: false, canScrollNext: false });
  const [selectedImage, setSelectedImage] = useState<DiscordChannelImage | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -12%' });

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = track;
    const tolerance = 8;
    setControlsState({
      canScrollPrev: scrollLeft > tolerance,
      canScrollNext: scrollLeft + clientWidth < scrollWidth - tolerance
    });
  }, []);

  useEffect(() => {
    updateControls();
  }, [images.length, updateControls]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const onScroll = () => updateControls();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateControls]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const track = trackRef.current;
    if (!sentinel || !track || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void fetchNext();
          }
        });
      },
      {
        root: track,
        rootMargin: '120px',
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [fetchNext, hasMore]);

  const handleScroll = useCallback(
    (direction: 'prev' | 'next') => {
      const track = trackRef.current;
      if (!track) {
        return;
      }
      const amount = track.clientWidth * 0.85;
      const delta = direction === 'next' ? amount : -amount;
      track.scrollBy({ left: delta, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    },
    [prefersReducedMotion]
  );

  const handleCardOpen = useCallback((image: DiscordChannelImage) => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      lastFocusedRef.current = document.activeElement;
    } else {
      lastFocusedRef.current = null;
    }
    setSelectedImage(image);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedImage(null);
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!selectedImage || typeof document === 'undefined') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseLightbox();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    const bodyStyle = document.body.style;
    const previousOverflow = bodyStyle.overflow;
    bodyStyle.overflow = 'hidden';

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      bodyStyle.overflow = previousOverflow;
    };
  }, [handleCloseLightbox, selectedImage]);

  const showLoadingSkeletons = loading && images.length === 0;
  const showEmptyState = !loading && images.length === 0 && !error;

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="community-images" data-animate={prefersReducedMotion ? 'off' : 'on'}>
      <div className="container">
        <div className={styles.wrapper}>
          <SectionHeading
            eyebrow="Community"
            title="Community Bilder"
            description="Automatisch kuratierte Uploads aus dem Discord Media-Channel - immer die neuesten Eindruecke der Crew."
          />

          {error && (
            <div className={styles.errorBox} role="alert">
              <span>{error}</span>
              <button className={styles.retryButton} type="button" onClick={() => retry()}>
                Erneut versuchen
              </button>
            </div>
          )}

          {showEmptyState && <p className={styles.empty}>Im Moment liegen noch keine Bilder vor. Schau spaeter wieder vorbei!</p>}

          <div className={styles.carousel}>
            <div ref={trackRef} className={styles.track} role="list" aria-label="Discord Bilder">
              {showLoadingSkeletons ? (
                <LoadingSkeletonRow />
              ) : (
                images.map((image) => (
                  <div key={`${image.id}:${image.attachmentId}`} className={styles.gridItem} role="listitem">
                    <ImageCard image={image} animate={!prefersReducedMotion} onOpen={handleCardOpen} />
                  </div>
                ))
              )}
              <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
            </div>
            <div className={styles.controls} aria-hidden="true">
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => handleScroll('prev')}
                disabled={!controlsState.canScrollPrev}
                aria-label="Vorherige Bilder"
              >
                {'\u2039'}
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => handleScroll('next')}
                disabled={!controlsState.canScrollNext && !hasMore}
                aria-label="Naechste Bilder"
              >
                {'\u203A'}
              </button>
            </div>
          </div>

          {!showLoadingSkeletons && (loading || isFetchingMore) && (
            <p className={styles.status} role="status">
              Weitere Bilder werden geladen ...
            </p>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className={styles.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Vergroesserte Ansicht von ${selectedImage.author.name}`}
          onClick={handleCloseLightbox}
        >
          <div className={styles.lightboxShell} onClick={(event) => event.stopPropagation()}>
            <figure className={styles.lightboxFigure}>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.lightboxClose}
                onClick={handleCloseLightbox}
                aria-label="Ansicht schliessen"
              >
                &times;
              </button>
              <img className={styles.lightboxImage} src={selectedImage.imageUrl} alt={`Bild von ${selectedImage.author.name}`} />
              <figcaption className={styles.lightboxMeta}>
                <div className={styles.lightboxMetaPrimary}>
                  <span className={styles.lightboxCaptionLabel}>Autor</span>
                  <span className={styles.lightboxCaptionValue}>{selectedImage.author.name}</span>
                </div>
                <div className={styles.lightboxMetaPrimary}>
                  <span className={styles.lightboxCaptionLabel}>Hochgeladen</span>
                  <time className={styles.lightboxCaptionValue} dateTime={selectedImage.uploadedAt}>
                    {formatUploadedAt(selectedImage.uploadedAt)}
                  </time>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </section>
  );
}

interface ImageCardProps {
  image: DiscordChannelImage;
  animate: boolean;
  onOpen: (image: DiscordChannelImage) => void;
}

function ImageCard({ image, animate, onOpen }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const formattedDate = useMemo(() => formatUploadedAt(image.uploadedAt), [image.uploadedAt]);
  const initials = useMemo(() => image.author.name.trim().slice(0, 2).toUpperCase(), [image.author.name]);

  return (
    <article
      className={styles.card}
      data-animate={animate ? 'on' : 'off'}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Bild von ${image.author.name} vergroessern`}
      onClick={() => onOpen(image)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(image);
        }
      }}
    >
      <div className={styles.imageWrapper}>
        {!isLoaded && <div className={styles.skeleton} aria-hidden="true" />}
        <img
          src={image.imageUrl}
          alt={`Bild von ${image.author.name}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={clsx(styles.image, { [styles.isLoading]: !isLoaded })}
        />
      </div>
      <div className={styles.meta}>
        <div className={styles.author}>
          {image.author.avatarUrl ? (
            <div className={styles.avatar}>
              <img src={image.author.avatarUrl} alt="" aria-hidden="true" />
            </div>
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initials}
            </div>
          )}
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{image.author.name}</span>
            <time className={styles.timestamp} dateTime={image.uploadedAt}>
              {formattedDate}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingSkeletonRow() {
  return (
    <div className={styles.loadingRow} aria-hidden="true">
      <div className={styles.loadingCard} />
      <div className={styles.loadingCard} />
      <div className={styles.loadingCard} />
    </div>
  );
}
