import { useEffect, useRef } from 'react';

import { SectionHeading } from '@/lib/ui';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { apply3DTilt } from '@/lib/motion';

import styles from './PillarsSection.module.css';
import { selectBackgroundUrl } from '@/lib/utils';

// Statisches Set der 6 Karten
const cards = [
  { title: 'Hauling', tagline: 'Warentransport & Handel', variant: 'hauling' },
  { title: 'Industrial Gameplay', tagline: 'Mining, Salvaging, Refining', variant: 'industrial' },
  { title: 'Exploring', tagline: 'Erforschen des Verse', variant: 'exploring' },
  { title: 'Mission Gameplay', tagline: 'Missionen & Events', variant: 'missions' },
  { title: 'Escort Gameplay', tagline: 'Escort & Security', variant: 'escort' },
  { title: 'FPS Action', tagline: 'Combat & Security', variant: 'fps' }
];

export function PillarsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -15%', delay: 110, once: true });

  // Optionaler 3D-Tilt-Effekt auf Desktop
  useEffect(() => {
    if (prefersReducedMotion || !cardsRef.current) return;
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;
    const items = Array.from(cardsRef.current.querySelectorAll<HTMLElement>('article'));
    const cleanups = items.map((el) => apply3DTilt(el, 6));
    return () => cleanups.forEach((fn) => fn());
  }, [prefersReducedMotion]);

  // Dynamically apply background images from manifest when cards become visible
  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const variantToImage: Record<string, string> = {
      escort: '/images/ships/Hornet.webp',
      hauling: '/images/backgrounds/Starlancer.webp',
      industrial: '/images/ships/Terrapin.webp',
      exploring: '/images/ships/Carrack.webp',
      missions: '/images/ships/F7A.webp',
      fps: '/images/fps/visir.webp'
    };

    const articles = Array.from(container.querySelectorAll('article')) as HTMLElement[];

    const applyBg = async (el: HTMLElement) => {
      // Determine variant from data-attribute to avoid CSS module hashing issues
      const variant = (el.getAttribute('data-variant') || undefined) as keyof typeof variantToImage | undefined;
      if (!variant) return;
      const baseUrl = variantToImage[variant];
      if (!baseUrl) return;
      const rect = el.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const best = await selectBackgroundUrl(baseUrl, Math.ceil(rect.width), dpr);
      el.style.backgroundImage = `url('${best}')`;
      el.style.backgroundPosition = 'center';
      el.style.backgroundSize = 'cover';
      el.style.backgroundRepeat = 'no-repeat';
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          void applyBg(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '200px' });

    articles.forEach((el) => io.observe(el));

    const onResize = () => {
      // Optionally re-evaluate for already-applied cards on significant resize
      articles.forEach((el) => {
        if (el.style.backgroundImage) void applyBg(el);
      });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="mission">
      <div className="container">
        <SectionHeading eyebrow="Mission" title="Unser Portfolio" />
        <div ref={cardsRef} className={styles.cards} aria-label="HSTC Mission Grid">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`${styles.card} ${styles[`card--${card.variant}`]}`}
              data-reveal-item
              data-variant={card.variant}
            >
              {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
