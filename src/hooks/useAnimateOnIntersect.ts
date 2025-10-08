import { MutableRefObject, useCallback, useEffect } from 'react';
import anime from 'animejs';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type IntersectionHandler<T extends Element> = (element: T, context: { reducedMotion: boolean }) => void;

interface AnimateOnIntersectOptions {
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useAnimateOnIntersect<T extends Element>(
  ref: MutableRefObject<T | null>,
  handler: IntersectionHandler<T>,
  { once = true, rootMargin, threshold }: AnimateOnIntersectOptions = {}
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (reducedMotion) {
      handler(element, { reducedMotion: true });
      return;
    }

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (!hasAnimated || !once) {
            handler(element, { reducedMotion: false });
            hasAnimated = true;
          }

          if (once) {
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, handler, once, rootMargin, threshold, reducedMotion]);
}

interface StaggerRevealOptions extends AnimateOnIntersectOptions {
  targetsSelector?: string;
  translateY?: number;
  duration?: number;
  delay?: number;
  opacity?: [number, number];
}

export function useStaggerReveal<T extends HTMLElement>(
  ref: MutableRefObject<T | null>,
  {
    targetsSelector = '.section-heading, [data-reveal-item]',
    translateY = 24,
    duration = 600,
    delay = 90,
    opacity = [0, 1],
    once = true,
    rootMargin,
    threshold
  }: StaggerRevealOptions = {}
) {
  const handler = useCallback<IntersectionHandler<T>>(
    (element, { reducedMotion }) => {
      const targets = Array.from(element.querySelectorAll<HTMLElement>(targetsSelector));
      if (targets.length === 0) {
        return;
      }

      if (reducedMotion) {
        targets.forEach((target) => {
          target.style.opacity = '1';
          target.style.transform = 'none';
        });
        return;
      }

      const fresh = targets.filter(t => !t.dataset.revealed);
      if (fresh.length === 0) return;
      anime({
        targets: fresh,
        opacity,
        translateY: [translateY, 0],
        delay: anime.stagger(delay),
        duration,
        easing: 'easeOutCubic',
        complete: () => { fresh.forEach(f => { f.dataset.revealed = 'true'; }); }
      });
    },
    [delay, duration, opacity, targetsSelector, translateY]
  );

  useAnimateOnIntersect(ref, handler, { once, rootMargin, threshold });
}
