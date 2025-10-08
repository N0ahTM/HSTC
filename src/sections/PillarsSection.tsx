import { useEffect, useRef, useState, useCallback } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/motion/interactions';

import styles from './PillarsSection.module.css';

// Alle 6 Karten in einem gemeinsamen Grid
// (statisch außerhalb der Komponente definieren, damit keine Re-Renders Anime erneut triggern)
const cards = [
  {
    title: 'MACHTVOLLE DEMOKRATIE',
    tagline: 'Gemeinsam entscheiden',
    description:
      'Kein Alleinherrscher – jedes Mitglied hat eine Stimme. Unser Verwaltungsrat trifft demokratisch Entscheidungen.',
    variant: 'demokratie'
  },
  {
    title: 'D/A/CH COMMUNITY',
    tagline: 'Wir sind D/A/CH',
    description:
      'Deutsche, Schweizer & Österreicher vereint unter einem Banner. Wir kommunizieren auf Deutsch.',
    variant: 'dach'
  },
  {
    title: 'ELITE OPERATIONEN',
    tagline: 'Präzise Einsätze',
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
  const autoScrollTimer = useRef<number | null>(null);
  const isUserInteracting = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  // Derived list length
  const total = cards.length;

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -15%', delay: 110, once: true });

  useEffect(() => {
    if (prefersReducedMotion || !cardsRef.current) return;
    
    // Only apply on desktop (pointer: fine)
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    const cards = Array.from(cardsRef.current.querySelectorAll<HTMLElement>('article'));
    const cleanups = cards.map((card) => apply3DTilt(card, 6));

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [prefersReducedMotion]);


  // Update active index on scroll
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    let rAF: number;
    const handle = () => {
      const children = Array.from(el.querySelectorAll('article')) as HTMLElement[];
      if (!children.length) return;
      const scrollLeft = el.scrollLeft;
      const widths = children.map(c => c.offsetWidth + parseFloat(getComputedStyle(c).marginRight || '0'));
      // compute approximate index
      let acc = 0; let idx = 0;
      for (let i=0;i<widths.length;i++){ if (acc + widths[i]/2 > scrollLeft){ idx = i; break;} acc += widths[i]; if (i===widths.length-1) idx=i; }
      setActiveIndex(idx);
    };
    const onScroll = () => { cancelAnimationFrame(rAF); rAF = requestAnimationFrame(handle); };
    el.addEventListener('scroll', onScroll, { passive: true });
    handle();
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(rAF); };
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const el = cardsRef.current; if (!el) return;
    const children = el.querySelectorAll('article');
    const target = children[index] as HTMLElement | null;
    if (target) {
      el.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  }, []);

  const next = useCallback(() => {
    setActiveIndex((idx) => {
      const nextIdx = (idx + 1) % total;
      scrollToIndex(nextIdx);
      return nextIdx;
    });
  }, [total, scrollToIndex]);

  const prev = useCallback(() => {
    setActiveIndex((idx) => {
      const prevIdx = (idx - 1 + total) % total;
      scrollToIndex(prevIdx);
      return prevIdx;
    });
  }, [total, scrollToIndex]);

  // Auto scroll: startet einmal und wird nach erster User-Interaktion permanent deaktiviert
  useEffect(() => {
    if (prefersReducedMotion) return;
    let stoppedByUser = false;
    const stop = () => { if (autoScrollTimer.current) { clearInterval(autoScrollTimer.current); autoScrollTimer.current = null; } };
    autoScrollTimer.current = window.setInterval(() => {
      if (isUserInteracting.current || stoppedByUser) return;
      next();
    }, 4000);
    const markUser = () => { if (!stoppedByUser) { stoppedByUser = true; stop(); } };
    const el = cardsRef.current;
    if (el) {
      el.addEventListener('wheel', markUser, { passive: true });
      el.addEventListener('pointerdown', markUser, { passive: true });
      el.addEventListener('click', markUser, { passive: true });
      el.addEventListener('keydown', markUser, { passive: true });
    }
    return () => {
      stop();
      if (el) {
        el.removeEventListener('wheel', markUser);
        el.removeEventListener('pointerdown', markUser);
        el.removeEventListener('click', markUser);
        el.removeEventListener('keydown', markUser);
      }
    };
  }, [next, prefersReducedMotion]);

  // Pause on hover / focus
  useEffect(() => {
    const el = cardsRef.current; if (!el) return;
    const enter = () => { isUserInteracting.current = true; };
    const leave = () => { isUserInteracting.current = false; };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', enter);
    el.addEventListener('focusout', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', enter);
      el.removeEventListener('focusout', leave);
    };
  }, []);

  // Wheel vertical -> horizontal
  useEffect(() => {
    const el = cardsRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY; // convert vertical to horizontal
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag / swipe
  useEffect(() => {
    const el = cardsRef.current; if (!el) return;
    let startX = 0; let scrollStart = 0; let dragging = false; let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left only
      dragging = true; moved = false; startX = e.clientX; scrollStart = el.scrollLeft; el.setPointerCapture(e.pointerId); isUserInteracting.current = true;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return; const dx = e.clientX - startX; if (Math.abs(dx) > 3) moved = true; el.scrollLeft = scrollStart - dx; };
    const onUp = (e: PointerEvent) => { if (!dragging) return; dragging = false; el.releasePointerCapture(e.pointerId); setTimeout(()=>{isUserInteracting.current=false;}, 1500); };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, []);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="mission">
      <div className="container">
        <SectionHeading
          eyebrow="Mission"
          title="Unser Portfolio"
        />
        <div
          ref={cardsRef}
          className={styles.cards}
          role="group"
          aria-label="HSTC Mission Carousel"
        >
          {cards.map((card) => (
            <article
              key={card.title}
              className={`${styles.card} ${styles[`card--${card.variant}`]}`}
              data-reveal-item
            >
              {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
        <div className={styles.carouselControls} aria-hidden="false">
          <button type="button" className={styles.navBtn} onClick={prev} aria-label="Vorherige">
            ‹
          </button>
          <div className={styles.dotNav} role="group" aria-label="Slides">
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.dotBtn}
                aria-pressed={i === activeIndex ? 'true' : 'false'}
                aria-label={`Slide ${i + 1}`}
                onClick={() => { setActiveIndex(i); scrollToIndex(i); }}
              />
            ))}
          </div>
          <button type="button" className={styles.navBtn} onClick={next} aria-label="Nächste">
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
