# Animationsleitfaden

Dieser Leitfaden erklärt, wie die Anime.js-gestützten Animationen in der HSTC-Seite aufgebaut sind und wie du sie erweitern kannst.

## Grundlagen

- **Bibliothek**: [Anime.js](https://animejs.com/documentation) wird als zentrale Animationsengine genutzt (`animejs`).
- **Bewegungsvorlieben**: Über den Hook `usePrefersReducedMotion` sowie CSS-Klassen auf `<html>` werden Animationen deaktiviert, wenn Nutzer `prefers-reduced-motion` aktiviert haben.
- **Intersection Observer**: Der Hook `useAnimateOnIntersect` (bzw. `useStaggerReveal`) koppelt Scroll-Reveals an die Sichtbarkeit eines Elements.
- **Zähler**: Der Hook `useAnimatedNumber` animiert numerische Werte z. B. für Live-Statistiken.

## Wichtige Module

| Datei | Zweck |
| --- | --- |
| `src/hooks/usePrefersReducedMotion.ts` | Abfrageschicht für `prefers-reduced-motion` Media Query. |
| `src/hooks/useAnimateOnIntersect.ts` | Intersection Observer + Anime.js-Callback, plus `useStaggerReveal` Hilfsfunktion. |
| `src/hooks/useAnimatedNumber.ts` | Animiert Zahlenwerte in DOM-Elementen. |
| `src/motion/hero.ts` | Enthält Hero-spezifische Timelines (Intro + Logo-Drift) und Utility `stopAnimations`. |

## Scroll-Reveal einsetzen

1. Erstelle eine `useRef<HTMLElement | null>` Referenz auf die Sektion.
2. Rufe `useStaggerReveal(sectionRef)` im Komponenten-Body auf.
3. Versehe alle Items innerhalb der Sektion, die gestaffelt erscheinen sollen, mit `data-reveal-item` oder eigenen Selektoren via Optionsobjekt.

```tsx
const sectionRef = useRef<HTMLElement | null>(null);
useStaggerReveal(sectionRef, { delay: 120, translateY: 32 });

return (
  <section ref={sectionRef}>
    <h2>Heading</h2>
    <div data-reveal-item>…</div>
  </section>
);
```

## Eigene Timelines bauen

Wenn du komplexere Abläufe brauchst:

```tsx
import anime from 'animejs';

useEffect(() => {
  if (prefersReducedMotion) return;

  const timeline = anime.timeline({ easing: 'easeOutQuart' });
  timeline
    .add({ targets: headingRef.current, opacity: [0, 1], translateY: [24, 0] })
    .add({ targets: cardsRef.current?.children, opacity: [0, 1], scale: [0.9, 1], delay: anime.stagger(80) }, '-=200');

  return () => timeline.pause();
}, [prefersReducedMotion]);
```

Achte darauf, Timelines im Cleanup zu stoppen, um Speicherlecks zu vermeiden.

## Zahlen animieren

```tsx
const valueRef = useRef<HTMLSpanElement | null>(null);
useAnimatedNumber(statsValue, valueRef, { duration: 800 });

return <span ref={valueRef}>{statsValue ?? '—'}</span>;
```

Der Hook kümmert sich um Platzhalter, reduzierte Bewegung und Rundung.

## Accessibility & Performance

- Animationen gelten als dekorativ: keine wichtigen Informationen dürfen ausschließlich animiert dargestellt werden.
- Bei `prefers-reduced-motion` werden alle animierten Elemente sofort in den Endzustand gesetzt.
- Nutze transform/opacity statt Layout-Eigenschaften für flüssige Performance.
- Füge Animationen sparsam hinzu: zu viele parallele Timelines können Mobile-Geräte belasten.

## Ideen für Erweiterungen

- **Timeline-Sync**: Mehrere Sektionen über einen globalen Timeline-Controller koordinieren.
- **Perspective Reveal**: `rotateX/rotateY` in `useStaggerReveal` für 3D-Karten.
- **Section-Waypoints**: Scroll-Progress (z. B. Progress-Bar im Nav) mit Anime.js `setDashoffset` animieren.
- **Sound Hooks**: Bei optischen Highlights optional Audioeffekte (mit Rücksicht auf Accessibility).

## Fehlerbehebung

- Prüfe, ob Referenzen (`ref`) gesetzt sind, bevor du Anime.js aufrufst.
- Bei SSR/Build-Fehlern sicherstellen, dass `window` nur im `useEffect` genutzt wird.
- Verwende `npm run build`, um TS-Fehler früh zu erkennen.

Mit diesem Setup kannst du jede Sektion der Seite mit konsistenten, leicht wartbaren Animationen ausstatten.
