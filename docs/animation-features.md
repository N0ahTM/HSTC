# Erweiterte Animationen â€“ Ãœbersicht & Deaktivierung

Dieses Dokument beschreibt alle neu implementierten Premium-Animationen und wie du einzelne Features aktivieren/deaktivieren kannst.

## Ãœbersicht der Features

### âœ… Implementiert

| Feature | Beschreibung | Dateien | Deaktivieren |
|---------|-------------|---------|--------------|
| **Hero Letter-Reveal** | Buchstaben des Titels "HSTC" erscheinen gestaffelt von der Mitte | `HeroSection.tsx`, `textEffects.ts` | Entferne `splitLetters` & `letterReveal` Aufrufe |
| **Logo Scan-Line** | Licht-Sweep Ã¼ber das Logo alle ~4.5s | `HeroSection.tsx/.css`, `ambient.ts` | Entferne `.scan-line` Element & `scanLineSweep` Aufruf |
| **Starfield Twinkle** | 60 animierte Sterne im Hintergrund | `App.tsx`, `ambient.ts` | Kommentiere `createStarfield` aus |
| **Nebula Pulse** | Subtile OpazitÃ¤ts-Pulsation der Background-Layer | `App.tsx`, `ambient.ts` | Kommentiere `nebulaPulse` aus |
| **Meteor Trace** | Gelegentliche diagonale Meteor-Streifen (alle 30â€“50s) | `App.tsx`, `ambient.ts` | Entferne `spawnMeteor` Logik |
| **Scroll Progress Bar** | DÃ¼nner oranger Top-Balken zeigt Scroll-Fortschritt | `ScrollProgress.tsx/.css` | Entferne `<ScrollProgress />` in `App.tsx` |
| **Community Card Fade** | Karten blenden beim Event-Filter per CSS ein | `CommunitySection.tsx/.module.css` | Entferne `@keyframes cardEnter` oder setze `data-animate="off"` |
| **Stats Flash** | Discord-Zahlen blinken kurz bei ErhÃ¶hung | `StatsFlashWrapper.tsx`, `interactions.ts` | Wrapper nicht verwenden |
| **3D Card Tilt** | Pillars-Karten kippen bei Mouse-Bewegung (nur Desktop) | `PillarsSection.tsx`, `interactions.ts` | Entferne `apply3DTilt` useEffect |
| **Button Press Feedback** | Bounce-Effekt bei Klick auf CTAs | `JoinSection.tsx`, `interactions.ts` | Entferne `handleClick` mit `buttonPress` |

---

## Detaillierte Deaktivierungsschritte

### 1. Hero Letter-Reveal

**Datei:** `src/sections/HeroSection.tsx`

**Entfernen:**
```tsx
// Import entfernen:
import { splitLetters, letterReveal } from '@/motion/textEffects';

// In useEffect:
if (titleRef.current && titleRef.current.textContent) {
  const chars = splitLetters(titleRef.current);
  animations.push(letterReveal(chars, { delay: 400, from: 'center' }));
}
```

**Reaktivieren Standard:**
```tsx
// Setze `title: titleRef.current` statt `title: null` in playHeroIntro
```

---

### 2. Logo Scan-Line

**Datei:** `src/sections/HeroSection.tsx` & `.module.css`

**TSX entfernen:**
```tsx
<div className="scan-line" aria-hidden="true" />
```

**CSS entfernen:**
```css
.logoWrapper :global(.scan-line) { ... }
```

**useEffect Zeile lÃ¶schen:**
```tsx
if (scanOverlay) {
  animations.push(scanLineSweep(scanOverlay, { delay: 3000 }));
}
```

---

### 3. Starfield / Nebula / Meteor

**Datei:** `src/App.tsx`

**Starfield deaktivieren:**
```tsx
// Kommentiere aus:
// const starAnimations = createStarfield(space, { count: 60, twinkleSpeed: 5000 });
// animations.push(...starAnimations);
```

**Nebula deaktivieren:**
```tsx
// Kommentiere aus:
// animations.push(nebulaPulse(space, { duration: 14000 }));
```

**Meteor deaktivieren:**
```tsx
// LÃ¶sche kompletten Block:
const spawnMeteor = () => { ... };
const meteorTimeout = setTimeout(spawnMeteor, 8000);
// und im return: clearTimeout(meteorTimeout);
```

---

### 4. Scroll Progress Bar

**Datei:** `src/App.tsx`

**Entfernen:**
```tsx
import { ScrollProgress } from '@/components/ScrollProgress';
// ...
<ScrollProgress />
```

Optional: LÃ¶sche komplette Komponente `src/components/ScrollProgress.tsx` & `.module.css`.

---

### 5. Community Card Fade

**Datei:** `src/sections/CommunitySection.tsx`

**Anpassen / Deaktivieren:**
- Setze bei Bedarf `data-animate="off"` auf dem Section-Element, um alle Karten-Animationen zu überspringen.
- Entferne in `CommunitySection.module.css` den Eintrag `@keyframes cardEnter` und die zugehörige `animation`-Eigenschaft, wenn die Karten ohne Fade erscheinen sollen.

---

### 6. Stats Flash

**Datei:** `src/components/StatsFlashWrapper.tsx`

Falls du diesen Wrapper nutzt, einfach **nicht verwenden** und direkt `useAnimatedNumber` nutzen.

---

### 7. 3D Card Tilt (Pillars)

**Datei:** `src/sections/PillarsSection.tsx`

**Entfernen:**
```tsx
import { apply3DTilt } from '@/motion/interactions';
const cardsRef = useRef<HTMLDivElement | null>(null);

// useEffect Block lÃ¶schen:
useEffect(() => {
  if (prefersReducedMotion || !cardsRef.current) return;
  // ...
}, [prefersReducedMotion]);
```

---

### 8. Button Press Feedback

**Datei:** `src/sections/JoinSection.tsx`

**Entfernen:**
```tsx
import { buttonPress } from '@/motion/interactions';

const handleClick = useCallback(...);  // LÃ¶schen

// Buttons zurÃ¼ck zu:
onClick={onJoin}  // statt onClick={(e) => handleClick(e, onJoin)}
```

---

## Globale Deaktivierung (Notfall)

Falls **alle** neuen Animationen auf einmal deaktiviert werden sollen (z.B. Performance-Probleme):

1. Setze `data-prefers-reduced-motion="true"` manuell auf `<html>`-Element (Ã¼ber Browser DevTools).
2. Alle Animationen werden sofort Ã¼bersprungen (bereits implementiert via `usePrefersReducedMotion`).

---

## Performance-Hinweise

- **Starfield** (60 Sterne): ~5â€“8ms CPU pro Frame (Mobile beachten).
- **3D Tilt**: Nur auf Desktop (`pointer: fine` Media Query).
- **Meteors**: Max 1 gleichzeitig, alle 30â€“50s â€“ vernachlÃ¤ssigbar.
- **Filter Transition**: Blockiert nicht UI, ~500ms Timeline.

---

## Erweiterungsideen (Nicht implementiert)

- **Orbital Particles**: SVG-Pfad-Animation um Logo (vorbereitet in `interactions.ts`).
- **Text Outline Draw**: Stroke-Animation fÃ¼r Subtitle (siehe `textEffects.ts` Kommentare).
- **Voice Ratio Ring**: SVG strokeDashoffset fÃ¼r Discord Stats (manual impl. nÃ¶tig).
- **Idle Mode Easter Egg**: Drone-Partikel nach 45s InaktivitÃ¤t.

---

## Zusammenfassung

Alle Features sind **opt-out** â€“ d.h. standardmÃ¤ÃŸig aktiv. Du kannst einzelne Elemente entfernen, indem du:
1. Imports lÃ¶schst.
2. Funktionsaufrufe kommentierst/lÃ¶schst.
3. Optional: Utility-Dateien in `src/motion/` lÃ¶schen, falls komplett ungenutzt.

**Empfehlung:** Teste erst im Browser, welche Animationen dir gefallen, dann lÃ¶sche gezielt ungewollte Features.










