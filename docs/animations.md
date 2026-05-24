# Animation System

## Philosophy

All animations are **progressive enhancement**. They convey no essential information and are completely suppressed when the user has `prefers-reduced-motion` enabled. The system is built on Anime.js with a custom abstraction layer to keep timelines consistent, performant, and cleanup-safe.

## Motion Architecture

```
src/motion/
├── hero.ts         # Hero-specific timelines (intro sequence, logo drift)
├── ambient.ts      # Background effects (starfield, nebula, meteors)
├── textEffects.ts  # Typography animations (letter reveal, split text)
├── interactions.ts # User-driven effects (3D tilt, button press, carousel)
└── carousel.ts     # Carousel transition logic
```

## Core Hooks

| Hook | Purpose |
|---|---|
| `usePrefersReducedMotion` | Media query wrapper that drives all motion gates |
| `useAnimateOnIntersect` | Intersection Observer + Anime.js callback |
| `useStaggerReveal` | Convenience wrapper for scroll-triggered staggered reveals |
| `useAnimatedNumber` | Numeric value interpolation with cleanup |

## Scroll Reveal Pattern

Sections use `useStaggerReveal` to animate children into view as the user scrolls:

```tsx
const sectionRef = useRef<HTMLElement | null>(null);
useStaggerReveal(sectionRef, { delay: 120, translateY: 32 });

return (
  <section ref={sectionRef}>
    <h2>Heading</h2>
    <div data-reveal-item>Card 1</div>
    <div data-reveal-item>Card 2</div>
  </section>
);
```

## Custom Timeline Pattern

For complex orchestrated sequences:

```tsx
useEffect(() => {
  if (prefersReducedMotion) return;

  const timeline = anime.timeline({ easing: 'easeOutQuart' });
  timeline
    .add({ targets: headingRef.current, opacity: [0, 1], translateY: [24, 0] })
    .add({ targets: cardsRef.current?.children, opacity: [0, 1], scale: [0.9, 1], delay: anime.stagger(80) }, '-=200');

  return () => timeline.pause();
}, [prefersReducedMotion]);
```

Every timeline is paused in cleanup to prevent memory leaks.

## Accessibility

- `prefers-reduced-motion`: All animated elements skip to their end state immediately.
- No critical information is conveyed through motion alone.
- Transform and opacity are used exclusively for GPU-accelerated rendering.

## Performance Rules

- Animate only `transform` and `opacity`.
- Limit concurrent timelines on mobile.
- Use `IntersectionObserver` to avoid running off-screen animations.
- Clean up all Anime.js instances on unmount.
