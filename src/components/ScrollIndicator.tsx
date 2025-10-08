import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './ScrollIndicator.module.css';

interface ScrollIndicatorProps {
  targetId?: string; // id der nächsten Sektion
  label?: string; // Text z.B. "Scroll für mehr"
}

export function ScrollIndicator({ targetId = 'mission', label = 'Scroll für mehr' }: ScrollIndicatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLButtonElement | null>(null);
  const floatAnimationRef = useRef<anime.AnimeInstance | null>(null);
  const fadeOutRef = useRef<anime.AnimeInstance | null>(null);
  const hasFadedRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (!prefersReducedMotion) {
      // Animate both arrows slightly as a gentle vertical float
      floatAnimationRef.current = anime({
        targets: el.querySelectorAll(`.${styles.icon}`),
        translateY: [0, -6],
        duration: 1600,
        delay: anime.stagger(120),
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true
      });
    }

    const onScroll = () => {
      if (hasFadedRef.current || !el) return;
      if (window.scrollY > 40) {
        hasFadedRef.current = true;
        fadeOutRef.current = anime({
          targets: el,
          opacity: [1, 0],
          translateY: [0, -6],
          duration: 420,
          easing: 'easeOutQuad',
          complete: () => {
            el.style.pointerEvents = 'none';
            el.style.display = 'none';
          }
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      floatAnimationRef.current?.pause();
      fadeOutRef.current?.pause();
    };
  }, [prefersReducedMotion]);

  const handleClick = () => {
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      ref={wrapperRef}
      type="button"
      className={styles.indicator}
      aria-label={label}
      onClick={handleClick}
    >
      <span className={styles.icon} aria-hidden="true">↓</span>
      <span className={styles.text}>{label}</span>
      <span className={styles.icon} aria-hidden="true">↓</span>
    </button>
  );
}
