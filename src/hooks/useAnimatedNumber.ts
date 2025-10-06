import { useEffect, useRef, type MutableRefObject } from 'react';
import anime from 'animejs';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface AnimatedNumberOptions {
  duration?: number;
  placeholder?: string;
  format?: (value: number) => string;
}

export function useAnimatedNumber<T extends HTMLElement>(
  value: number | null,
  elementRef: MutableRefObject<T | null>,
  { duration = 1200, placeholder = '—', format = (v: number) => `${Math.round(v)}` }: AnimatedNumberOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const previousValue = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (value === null) {
      element.textContent = placeholder;
      previousValue.current = null;
      return;
    }

    if (prefersReducedMotion) {
      element.textContent = format(value);
      previousValue.current = value;
      return;
    }

    const startValue = previousValue.current ?? Number(element.textContent?.replace(/[^0-9.-]/g, '') || 0);

    if (startValue === value) {
      return;
    }

    const counter = { value: startValue };
    const animation = anime({
      targets: counter,
      value,
      duration,
      easing: 'easeOutCubic',
      round: 1,
      update: () => {
        element.textContent = format(counter.value);
      }
    });

    previousValue.current = value;

    return () => animation.pause();
  }, [duration, format, placeholder, prefersReducedMotion, value, elementRef]);
}
