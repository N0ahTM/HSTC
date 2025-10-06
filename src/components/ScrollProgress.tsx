import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { updateScrollProgress } from '@/motion/ambient';

import styles from './ScrollProgress.module.css';

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const handleScroll = () => {
      if (prefersReducedMotion) {
        const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = `${Math.min(progress * 100, 100)}%`;
      } else {
        updateScrollProgress(bar);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  return <div ref={barRef} className={styles.bar} aria-hidden="true" />;
}
