import { useEffect, useRef, useState, useCallback } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/motion/interactions';
import { animateScrollTo, highlightActiveCard, scheduleSnap } from '@/motion/carousel';

import styles from './PillarsSection.module.css';

// Alle 6 Karten in einem gemeinsamen Grid
// (statisch außerhalb der Komponente definieren, damit keine Re-Renders Anime erneut triggern)
const cards = [
  {
    title: 'MACHTVOLLE DEMOKRATIE',
    tagline: 'Gemeinsam entscheiden',
    variant: 'demokratie'
  },
  {
    title: 'D/A/CH COMMUNITY',
    tagline: 'Wir sind D/A/CH',
    variant: 'community'
  },
  {
    title: 'Hauling',
    tagline: 'Waren Transport und Handel',
    variant: 'hauling'
  },
  {
    title: 'Industrial Gameplay',
    tagline: 'Mining, Salvaging, Refining',
    variant: 'industrial'
  },
  {
    title: 'Exploring',
    tagline: 'Erforschen des Verses',
    variant: 'exploring'
  },
  {
    title: 'Mission gameplay',
    tagline: 'Missionen und Events',
    variant: 'missions'
  },
  {
    title: 'Fps Action',
    tagline: 'Combat & Security',
    variant: 'fps'
  }
];

export function PillarsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const autoScrollTimer = useRef<number | null>(null);
  const isUserInteracting = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const snapState = useRef<{ timer: number | null }>({ timer: null });

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


  // Update active index on scroll (with tolerant first-card threshold + hysteresis)
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    let rAF: number;
    let lastIdx = 0; // store to apply hysteresis
    const handle = () => {
      const children = Array.from(el.querySelectorAll('article')) as HTMLElement[];
      if (!children.length) return;
      const scrollLeft = el.scrollLeft;
      const widths = children.map(c => c.offsetWidth + parseFloat(getComputedStyle(c).marginRight || '0'));
      // compute approximate index (stay longer on first)
      let acc = 0; let idx = 0;
      for (let i=0;i<widths.length;i++) {
        const baseThreshold = widths[i] / 2;
        // For first: larger threshold forward so it does not leave too early
        // For transitions back to previous: require a bit more movement forward (hysteresis)
        let threshold = baseThreshold;
        if (i === 0) {
          threshold = widths[i] * 0.8; // 80% forward before switching to 2
        } else if (i === lastIdx + 1) {
          // moving forward; require a little more than half to commit
          threshold = baseThreshold * 0.72;
        } else if (i === lastIdx - 1) {
          // moving backward; allow earlier switch
          threshold = baseThreshold * 0.42;
        }
        if (acc + threshold > scrollLeft) { idx = i; break; }
        acc += widths[i];
        if (i === widths.length - 1) idx = i;
      }
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIndex(idx);
      }
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
      // Use anime for controlled timing (respect reduced motion)
      if (prefersReducedMotion) {
        el.scrollTo({ left: target.offsetLeft, behavior: 'auto' });
      } else {
        animateScrollTo(el, target.offsetLeft, { duration: 520, easing: 'easeOutCubic' });
      }
    }
  }, [prefersReducedMotion]);

  const next = useCallback(() => {
    setActiveIndex(idx => {
      if (idx >= total - 1) return idx; // clamp at end
      const nextIdx = idx + 1;
      scrollToIndex(nextIdx);
      return nextIdx;
    });
  }, [total, scrollToIndex]);

  const prev = useCallback(() => {
    setActiveIndex(idx => {
      if (idx <= 0) return idx; // clamp at start
      const prevIdx = idx - 1;
      scrollToIndex(prevIdx);
      return prevIdx;
    });
  }, [scrollToIndex]);

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
      // Ignore if horizontal intent is stronger (native horizontal scroll / shift+wheel etc.)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // Nothing to do if content not scrollable horizontally
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      // If at boundaries and user keeps scrolling further outward, allow default page scroll
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= maxScroll)) {
        return;
      }

      // Normalize delta across deltaModes (0=pixel,1=line,2=page)
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16; // approx line height
      else if (e.deltaMode === 2) delta *= el.clientHeight;

      // Apply a small multiplier for a bit more responsive feel on standard wheels
      const factor = 1.05;
      // Disable snap while user actively scrolls wheel
      if (el.style.scrollSnapType !== 'none') {
        el.style.scrollSnapType = 'none';
      }
      el.scrollBy({ left: delta * factor, behavior: 'auto' });
      // schedule snap after user stops scrolling
      scheduleSnap(el, snapState.current, 160, { reducedMotion: prefersReducedMotion });
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); };
  }, [prefersReducedMotion]);

  // Drag / swipe
  useEffect(() => {
    const el = cardsRef.current; if (!el) return;
    let startX = 0; let scrollStart = 0; let dragging = false; let moved = false; let lastX = 0; let lastTime = 0; let velocity = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left only
      dragging = true; moved = false; startX = e.clientX; scrollStart = el.scrollLeft; el.setPointerCapture(e.pointerId); isUserInteracting.current = true; lastX = e.clientX; lastTime = performance.now(); velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX; if (Math.abs(dx) > 3) moved = true; el.scrollLeft = scrollStart - dx;
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (lastX - e.clientX) / dt; // px per ms (negative means moving right)
        lastX = e.clientX; lastTime = now;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return; dragging = false; el.releasePointerCapture(e.pointerId);
      // momentum effect
      if (!prefersReducedMotion && Math.abs(velocity) > 0.02) {
        const momentum = velocity * 3200; // scale to pixels
        let target = el.scrollLeft + momentum;
        if (target < 0) target = 0; else if (target > el.scrollWidth - el.clientWidth) target = el.scrollWidth - el.clientWidth;
        animateScrollTo(el, target, { duration: 650, easing: 'easeOutCubic', onComplete: () => scheduleSnap(el, snapState.current, 0, { reducedMotion: prefersReducedMotion }) });
      } else {
        scheduleSnap(el, snapState.current, 60, { reducedMotion: prefersReducedMotion });
      }
      setTimeout(()=>{isUserInteracting.current=false;}, 800);
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [prefersReducedMotion]);

  // Highlight active card
  useEffect(() => {
    if (prefersReducedMotion) return; // still highlight in next effect below
    const el = cardsRef.current; if (!el) return;
    const children = Array.from(el.querySelectorAll<HTMLElement>('article'));
    highlightActiveCard(children, activeIndex, { reducedMotion: prefersReducedMotion });
  }, [activeIndex, prefersReducedMotion]);

  // Ensure reduced motion still updates styles (no animation path)
  useEffect(() => {
    if (!prefersReducedMotion) return; const el = cardsRef.current; if (!el) return;
    const children = Array.from(el.querySelectorAll<HTMLElement>('article'));
    highlightActiveCard(children, activeIndex, { reducedMotion: true });
  }, [prefersReducedMotion, activeIndex]);

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
          <button type="button" className={styles.navBtn} onClick={prev} aria-label="Vorherige" disabled={activeIndex === 0} aria-disabled={activeIndex === 0 ? 'true' : 'false'}>
            ‹
          </button>
          <div className={styles.dotNav} role="group" aria-label="Slides">
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.dotBtn}
                aria-current={i === activeIndex ? 'true' : undefined}
                aria-label={`Slide ${i + 1}`}
                disabled={i === activeIndex}
                onClick={() => { if (i !== activeIndex) { setActiveIndex(i); scrollToIndex(i); } }}
              />
            ))}
          </div>
          <button type="button" className={styles.navBtn} onClick={next} aria-label="Nächste" disabled={activeIndex === total - 1} aria-disabled={activeIndex === total - 1 ? 'true' : 'false'}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
