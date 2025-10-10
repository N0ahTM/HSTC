import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { flashValue } from '@/motion/interactions';

interface StatsFlashWrapperProps {
  value: number | null;
  children: (ref: React.RefObject<HTMLSpanElement>) => React.ReactNode;
}

export function StatsFlashWrapper({ value, children }: StatsFlashWrapperProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const prevValue = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useAnimatedNumber(value, spanRef);

  useEffect(() => {
    if (prefersReducedMotion || !spanRef.current) return;
    
    if (prevValue.current !== null && value !== null && value > prevValue.current) {
      flashValue(spanRef.current, { scale: 1.15, duration: 380 });
    }
    
    prevValue.current = value;
  }, [value, prefersReducedMotion]);

  return <>{children(spanRef)}</>;
}
