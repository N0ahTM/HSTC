import { useCallback, useEffect, useRef } from 'react';
import anime from 'animejs';
import clsx from 'clsx';
import styles from './SpaceBackground.module.css';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Vec2 = { x: number; y: number };
type CirclePixels = { cx: number; cy: number; radius: number };
type CirclePercent = { cxPct: number; cyPct: number; rPct: number };

interface PlanetArtCalibration {
  sourceWidth: number;
  sourceHeight: number;
  circle: CirclePixels;
}

const PLANET_ART: PlanetArtCalibration = {
  sourceWidth: 3840,
  sourceHeight: 2160,
  circle: {
    cx: 1950, 
    cy: -3220,
    radius: 4050
  }
};

const BASE_VIEWPORT_AREA = 1920 * 1080;

function computeCircleFromCover(width: number, height: number): CirclePixels | null {
  if (!width || !height) return null;
  const { sourceWidth, sourceHeight, circle } = PLANET_ART;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const displayWidth = sourceWidth * scale;
  const displayHeight = sourceHeight * scale;
  const offsetX = (width - displayWidth) / 2;
  const offsetY = (height - displayHeight) / 2;

  return {
    cx: circle.cx * scale + offsetX,
    cy: circle.cy * scale + offsetY,
    radius: circle.radius * scale
  };
}

function circleIntersectsViewport(circle: CirclePixels, width: number, height: number): boolean {
  if (circle.radius <= 0) return false;
  const nearestX = Math.max(0, Math.min(circle.cx, width));
  const nearestY = Math.max(0, Math.min(circle.cy, height));
  const dx = nearestX - circle.cx;
  const dy = nearestY - circle.cy;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function circlesApproximatelyEqual(a: CirclePixels, b: CirclePixels, epsilon = 0.5): boolean {
  return (
    Math.abs(a.cx - b.cx) <= epsilon &&
    Math.abs(a.cy - b.cy) <= epsilon &&
    Math.abs(a.radius - b.radius) <= epsilon
  );
}

interface SpaceBackgroundProps {
  // Planet area is drawn above FX; by default we assume the screenshot framing
  // If you pass a circle, we will avoid spawning FX inside it to keep the planet clean
  planetCircle?: { cxPct: number; cyPct: number; rPct: number };
  // Debug: color shooting stars bright red to inspect paths
  meteorDebug?: boolean;
}

export function SpaceBackground({ planetCircle, meteorDebug }: SpaceBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const canvasDustRef = useRef<HTMLCanvasElement>(null);
  const canvasTrailsRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const planetLayerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const circlePxRef = useRef<CirclePixels>({ cx: 0, cy: 0, radius: 0 });
  const circlePctRef = useRef<CirclePercent>(planetCircle ?? { cxPct: 50, cyPct: -151, rPct: 110 });
  const viewportSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const particleBudgetRef = useRef<{ stars: number; dust: number }>({ stars: 0, dust: 0 });

  /**
   * Calibration:
   * Circle metrics originate from sampling `/images/backgrounds/Planet_4.webp`.
   * Consumers can override via `planetCircle` if needed.
   */

  const recomputeCircle = useCallback(
    (size?: { width: number; height: number }) => {
      const root = rootRef.current;
      if (!root) {
        return null;
      }
      const rect = size ?? root.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) {
        return null;
      }

      viewportSizeRef.current = { width, height };

      let nextCircle: CirclePixels | null = null;
      if (planetCircle) {
        nextCircle = {
          cx: (planetCircle.cxPct / 100) * width,
          cy: (planetCircle.cyPct / 100) * height,
          radius: (planetCircle.rPct / 100) * Math.max(width, height)
        };
      } else {
        nextCircle = computeCircleFromCover(width, height);
      }

      if (!nextCircle || !circleIntersectsViewport(nextCircle, width, height)) {
        return null;
      }

      const prev = circlePxRef.current;
      const changed = !circlesApproximatelyEqual(prev, nextCircle);
      circlePxRef.current = nextCircle;
      circlePctRef.current = {
        cxPct: (nextCircle.cx / width) * 100,
        cyPct: (nextCircle.cy / height) * 100,
        rPct: (nextCircle.radius / Math.max(width, height)) * 100
      };

      const host = rootRef.current;
      if (host) {
        host.style.setProperty('--planet-circle-cx', `${circlePctRef.current.cxPct}%`);
        host.style.setProperty('--planet-circle-cy', `${circlePctRef.current.cyPct}%`);
        host.style.setProperty('--planet-circle-r', `${circlePctRef.current.rPct}%`);
      }

      const area = width * height;
      const areaFactor = Math.max(0.65, Math.min(2.35, area / BASE_VIEWPORT_AREA));
      const targetStars = Math.round(220 * areaFactor);
      const targetDust = Math.round(140 * areaFactor);
      particleBudgetRef.current = { stars: targetStars, dust: targetDust };

      return nextCircle;
    },
    [planetCircle]
  );

  useEffect(() => {
    const rootNode = rootRef.current;
    if (!rootNode) return;
    const root = rootNode;

    const syncCircleMetrics = () => {
      const rect = root.getBoundingClientRect();
      recomputeCircle({ width: rect.width, height: rect.height });
    };

    syncCircleMetrics();
    if (reduceMotion) {
      const handleResize = () => syncCircleMetrics();
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }

    const dustCanvasNode = canvasDustRef.current;
    const trailsCanvasNode = canvasTrailsRef.current;
    const gridNode = gridRef.current;
    const planetNode = planetLayerRef.current;
    if (!dustCanvasNode || !trailsCanvasNode || !gridNode || !planetNode) {
      return;
    }
    const dustCanvas = dustCanvasNode;
    const trailsCanvas = trailsCanvasNode;
    const grid = gridNode;
    const planet = planetNode;

    let raf = 0;
    let running = true;
    const starNodes: HTMLElement[] = [];
    let starTweens: anime.AnimeInstance[] = [];
    let lastStarConfig = { width: 0, height: 0, count: 0 };

    type Dust = { x: number; y: number; r: number; a: number; vx: number; vy: number; hue: number };
    const dustCtx = dustCanvas.getContext('2d')!;
    const dust: Dust[] = [];

    function spawnDust(): Dust {
      const rect = root.getBoundingClientRect();
      let p: Dust;
      let guard = 0;
      do {
        p = {
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: 0.35 + Math.pow(Math.random(), 2.2) * 1.0,
          a: 0.02 + Math.random() * 0.06,
          vx: -0.02 + Math.random() * 0.04,
          vy: -0.02 + Math.random() * 0.04,
          hue: 12 + Math.random() * 10
        };
        guard++;
      } while (isInsidePlanetPx(p) && guard < 10);
      return p;
    }

    function ensureDustBudget(target: number) {
      const desired = Math.max(90, Math.round(Number.isFinite(target) ? target : dust.length));
      if (desired > dust.length) {
        for (let i = dust.length; i < desired; i++) dust.push(spawnDust());
      } else if (desired < dust.length) {
        dust.splice(desired);
      }
    }

    ensureDustBudget(particleBudgetRef.current.dust || 140);

    // Resize canvases to device-pixel ratio for crispness
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function resize() {
      const { width, height } = root.getBoundingClientRect();
      if (!width || !height) return;
      recomputeCircle({ width, height });

      for (const canvas of [dustCanvas, trailsCanvas]) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }

      const starContainer = starsRef.current;
      if (starContainer) {
        const targetCount = particleBudgetRef.current.stars || 260;
        const widthChanged = Math.abs(width - lastStarConfig.width) > 1;
        const heightChanged = Math.abs(height - lastStarConfig.height) > 1;
        const countChanged = targetCount !== lastStarConfig.count;
        if (widthChanged || heightChanged || countChanged) {
          anime.remove(starNodes);
          starNodes.forEach((n) => n.remove());
          starNodes.length = 0;
          starTweens.forEach((t) => t.pause());
          starTweens = [];

          for (let i = 0; i < targetCount; i++) {
            const star = document.createElement('span');
            star.style.position = 'absolute';
            const size = 0.6 + Math.pow(Math.random(), 2.6) * 2.0;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.borderRadius = '50%';
            const hueRoll = Math.random();
            let color: string;
            if (hueRoll < 0.6) color = `hsl(${210 + Math.random() * 20}, 40%, ${80 + Math.random() * 18}%)`;
            else if (hueRoll < 0.9) color = `hsl(${38 + Math.random() * 12}, 60%, ${78 + Math.random() * 16}%)`;
            else color = `hsl(${8 + Math.random() * 6}, 70%, ${72 + Math.random() * 14}%)`;
            star.style.background = color;

            let x = Math.random() * width;
            let y = Math.random() * height;
            let tries = 0;
            while (tries < 80) {
              if (!isInsidePlanetPx({ x, y })) break;
              x = Math.random() * width;
              y = Math.random() * height;
              tries++;
            }
            if (tries >= 80) continue;
            star.style.left = `${(x / width) * 100}%`;
            star.style.top = `${(y / height) * 100}%`;
            star.style.opacity = String(0.35 + Math.random() * 0.55);
            star.style.filter = `blur(${Math.random() < 0.3 ? 0.6 : 0}px)`;
            star.style.pointerEvents = 'none';
            starContainer.appendChild(star);
            starNodes.push(star);
          }

          starTweens = starNodes.map((n) =>
            anime({
              targets: n,
              opacity: [0.12, 0.9],
              duration: 6500 + Math.random() * 4500,
              delay: Math.random() * 1600,
              direction: 'alternate',
              easing: 'easeInOutSine',
              loop: true
            })
          );

          lastStarConfig = { width, height, count: starNodes.length };
        } else {
          // Only revalidate positions to keep clear of the planet rim
          const elems = Array.from(starContainer.children) as HTMLElement[];
          for (const node of elems) {
            const leftPct = parseFloat(node.style.left);
            const topPct = parseFloat(node.style.top);
            let px = (leftPct / 100) * width;
            let py = (topPct / 100) * height;
            if (isInsidePlanetPx({ x: px, y: py })) {
              let tries = 0;
              let nx = Math.random() * width;
              let ny = Math.random() * height;
              while (tries < 80) {
                if (!isInsidePlanetPx({ x: nx, y: ny })) break;
                nx = Math.random() * width;
                ny = Math.random() * height;
                tries++;
              }
              if (tries < 80) {
                node.style.left = `${(nx / width) * 100}%`;
                node.style.top = `${(ny / height) * 100}%`;
              }
            }
          }
        }
      }

      ensureDustBudget(particleBudgetRef.current.dust || dust.length);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    const handleWindowResize = () => resize();
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    function isInsidePlanetPx(p: Vec2): boolean {
      const circle = circlePxRef.current;
      if (circle.radius <= 0) return false;
      const dx = p.x - circle.cx;
      const dy = p.y - circle.cy;
      return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    // Grid gentle pulse (re-added)
    const gridTween = anime({
      targets: grid,
      opacity: [0.2, 0.36],
      duration: 24000,
      direction: 'alternate',
      easing: 'easeInOutSine',
      loop: true
    });

    // Planet breathing glow
    const planetTween = anime({
      targets: planet,
      opacity: [0.9, 1],
      duration: 26000, // slower
      direction: 'alternate',
      easing: 'easeInOutSine',
      loop: true,
    });

    // Wind influenced by mouse movement to make particles/trails react to direction
    const wind = { x: 0, y: 0 }; // CSS px per frame trend
    const targetWind = { x: 0, y: 0 };
    function onMouseMove(e: MouseEvent) {
      const rect = root.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height * 0.55; // a bit below center to reinforce downward glow
      const dx = (e.clientX - rect.left) - cx;
      const dy = (e.clientY - rect.top) - cy;
      const len = Math.hypot(dx, dy) || 1;
      const scale = 0.4; // strength
      targetWind.x = (dx / len) * scale;
      targetWind.y = (dy / len) * scale;
    }
    window.addEventListener('mousemove', onMouseMove);

    // Meteors: random point A -> random point B with tail, rAF scheduled (no timeout burst on tab return)
    const trailsCtx = trailsCanvas.getContext('2d')!;
    trailsCtx.globalCompositeOperation = 'lighter';

    interface MeteorTrailPoint { x: number; y: number; age: number; }
  interface Meteor { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; width: number; hue: number; sat: number; light: number; points: MeteorTrailPoint[]; }
    const meteors: Meteor[] = [];

    function randomPoint(rect: DOMRect): Vec2 {
      return { x: Math.random() * rect.width, y: Math.random() * rect.height };
    }
    function pathTouchesPlanet(a: Vec2, b: Vec2): boolean {
      // sample along the line
      for (let t = 0; t <= 1; t += 0.15) {
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        if (isInsidePlanetPx({ x: px, y: py })) return true;
      }
      return false;
    }
    function spawnMeteor() {
      const rect = root.getBoundingClientRect();
      let A: Vec2; let B: Vec2; let tries = 0;
      do {
        A = randomPoint(rect);
        B = randomPoint(rect);
        tries++;
        // ensure distance and not crossing planet & start/end outside planet
      } while ((tries < 40) && (Math.hypot(B.x - A.x, B.y - A.y) < rect.width * 0.3 || pathTouchesPlanet(A, B) || isInsidePlanetPx(A) || isInsidePlanetPx(B)));
      if (Math.hypot(B.x - A.x, B.y - A.y) < rect.width * 0.15) return; // give up (rare)
      const dist = Math.hypot(B.x - A.x, B.y - A.y);
      // speed: slower again (12-24s normal), debug 2.5-4.0s
      const durationMs = meteorDebug ? (2500 + Math.random() * 1500) : (12000 + Math.random() * 12000);
      const steps = Math.max(60, Math.round((durationMs / 1000) * 60));
      const vx = (B.x - A.x) / steps;
      const vy = (B.y - A.y) / steps;
  // size variation smaller (0.5 - 1.9 normal). Debug still larger for visibility.
  const width = meteorDebug ? 2.4 : (0.5 + Math.random() * 1.4);
      // white tone variation: choose between neutral white, slight cool, slight warm; low saturation, no orange
      let hue = 210 + Math.random() * 40; // base cool
      if (Math.random() < 0.35) hue = 190 + Math.random() * 30; // more bluish
      if (Math.random() < 0.25) hue = 0 + Math.random() * 12; // faint reddish (very subtle)
      const sat = 8 + Math.random() * 14; // low saturation for white look
      const light = 82 + Math.random() * 12;
      if (meteorDebug) { hue = 0; }
      meteors.push({ x: A.x, y: A.y, vx, vy, life: 0, maxLife: steps, width, hue, sat, light, points: [] });
    }

    let nextMeteorAt = performance.now() + (meteorDebug ? 800 : (5000 + Math.random() * 5000));
    let pageVisible = !document.hidden;
    function onVisibility() {
      pageVisible = !document.hidden;
      if (pageVisible) {
        // reschedule to a short delay to avoid burst of queued meteors
        nextMeteorAt = performance.now() + (meteorDebug ? 800 : 2500 + Math.random() * 3000);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    // no engine trails

    // Main loop
   // Rare star flash (bright quick flare of a random star)
   let flashTimer: number | null = null;
   function scheduleStarFlash() {
     if (!running || starNodes.length === 0) return;
     const delay = 15000 + Math.random() * 12000; // 15-27s
     flashTimer = window.setTimeout(() => {
       const target = starNodes[Math.floor(Math.random() * starNodes.length)];
       anime({
         targets: target,
         scale: [1, 2.6, 1],
         opacity: [anime.get(target, 'opacity'), 1, 0.18],
         duration: 1600,
         easing: 'easeOutQuad'
       });
       scheduleStarFlash();
     }, delay);
   }
   scheduleStarFlash();
    function step() {
      if (!running) return;

  // Ease wind towards target for smoothness (slower response)
  wind.x += (targetWind.x - wind.x) * 0.015;
  wind.y += (targetWind.y - wind.y) * 0.015;

      // Dust layer with clip to exclude planet region
      dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
      const rx = dustCanvas.width / root.clientWidth;
      const ry = dustCanvas.height / root.clientHeight;
      // Create an even-odd clip region = full rect minus circle
      const rectW = dustCanvas.width; const rectH = dustCanvas.height;
      const circle = circlePxRef.current;
      const clipCx = circle.cx * rx;
      const clipCy = circle.cy * ry;
      const clipR = circle.radius * dpr;
      dustCtx.save();
      dustCtx.beginPath();
      dustCtx.rect(0, 0, rectW, rectH);
      dustCtx.moveTo(clipCx + clipR, clipCy);
      dustCtx.arc(clipCx, clipCy, clipR, 0, Math.PI * 2);
      dustCtx.clip('evenodd');
      for (const d of dust) {
        d.x += d.vx + wind.x * 0.6; 
        d.y += d.vy + wind.y * 0.6;
        if (isInsidePlanetPx(d)) { d.x -= d.vx * 2; d.y -= d.vy * 2; }
        if (d.x < -5 || d.y < -5 || d.x > root.clientWidth + 5 || d.y > root.clientHeight + 5) Object.assign(d, spawnDust());
        dustCtx.beginPath();
        dustCtx.fillStyle = `hsla(${d.hue}, 80%, 60%, ${d.a})`;
        dustCtx.arc(d.x * rx, d.y * ry, d.r * dpr, 0, Math.PI * 2);
        dustCtx.fill();
      }
      dustCtx.restore();

      // Meteors layer
      trailsCtx.clearRect(0, 0, trailsCanvas.width, trailsCanvas.height);
      trailsCtx.save();
      trailsCtx.beginPath();
      trailsCtx.rect(0, 0, rectW, rectH);
      trailsCtx.moveTo(clipCx + clipR, clipCy);
      trailsCtx.arc(clipCx, clipCy, clipR, 0, Math.PI * 2);
      trailsCtx.clip('evenodd');

      const now = performance.now();
      if (pageVisible && now >= nextMeteorAt && !reduceMotion) {
        spawnMeteor();
        nextMeteorAt = now + (meteorDebug ? 3000 : (14000 + Math.random() * 14000));
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        const lifeRatio = m.life / m.maxLife; // 0..1
        m.x += m.vx + wind.x * 0.45; // subtle wind influence
        m.y += m.vy + wind.y * 0.45;
  // shorter tail: record every 3rd frame
  if (m.life % 3 === 0) m.points.push({ x: m.x, y: m.y, age: 0 });
        for (const pt of m.points) pt.age++;
  const maxTrail = meteorDebug ? 18 : 36; // slightly shorter tail
        if (m.points.length > maxTrail) m.points.splice(0, m.points.length - maxTrail);

        // Head alpha easing (fade in first 15%, out last 25%)
        let headAlpha: number;
        if (lifeRatio < 0.15) headAlpha = lifeRatio / 0.15; else if (lifeRatio > 0.75) headAlpha = (1 - lifeRatio) / 0.25; else headAlpha = 1;
        headAlpha = Math.max(0, Math.min(1, headAlpha));

        // Draw trail from newest backwards so width near head is largest
        for (let t = m.points.length - 1; t > 0; t--) {
          const pHead = m.points[t];
          const pTail = m.points[t - 1];
          const segRatio = 1 - (t / m.points.length); // 0 at head end -> 1 older
          const widthScale = 1 - segRatio * 0.9; // thin far away
          // Combine segment distance from head with headAlpha for fading
            const alpha = headAlpha * (1 - segRatio) * 0.9;
          if (alpha <= 0.01) continue;
          trailsCtx.strokeStyle = meteorDebug
            ? `rgba(255,0,0,${alpha})`
            : `hsla(${m.hue}, ${m.sat}%, ${m.light - segRatio * 12}%, ${alpha})`;
          trailsCtx.lineWidth = (m.width * dpr) * widthScale;
          trailsCtx.beginPath();
          trailsCtx.moveTo(pTail.x * rx, pTail.y * ry);
          trailsCtx.lineTo(pHead.x * rx, pHead.y * ry);
          trailsCtx.stroke();
        }
        // Head glow (slightly brighter + fade alpha)
        trailsCtx.beginPath();
  trailsCtx.fillStyle = meteorDebug ? `rgba(255,0,0,${headAlpha})` : `hsla(${m.hue}, ${m.sat + 10}%, ${Math.min(95, m.light + 8)}%, ${headAlpha})`;
        trailsCtx.arc(m.x * rx, m.y * ry, (m.width) * dpr, 0, Math.PI * 2);
        trailsCtx.fill();
        // Outer soft glow
        if (headAlpha > 0.05) {
          const gradient = trailsCtx.createRadialGradient(m.x * rx, m.y * ry, 0, m.x * rx, m.y * ry, m.width * 5 * dpr);
          if (meteorDebug) {
            gradient.addColorStop(0, `rgba(255,0,0,${0.35 * headAlpha})`);
            gradient.addColorStop(1, 'rgba(255,0,0,0)');
          } else {
            gradient.addColorStop(0, `hsla(${m.hue},${m.sat + 20}%,${Math.min(96, m.light + 10)}%,${0.35 * headAlpha})`);
            gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
          }
          trailsCtx.beginPath();
          trailsCtx.fillStyle = gradient;
          trailsCtx.arc(m.x * rx, m.y * ry, m.width * 5 * dpr, 0, Math.PI * 2);
          trailsCtx.fill();
        }

        if (m.life > m.maxLife) meteors.splice(i, 1);
      }
      trailsCtx.restore();

      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      starTweens.forEach((t) => t.pause());
      anime.remove(starNodes);
      starNodes.forEach((n) => n.remove());
      gridTween.pause();
      planetTween.pause();
    };
  }, [recomputeCircle, reduceMotion, meteorDebug]);
  return (
    <div className={clsx(styles.root)} ref={rootRef} aria-hidden>
      <div className={styles.fxLayer}>
        <div className={styles.starsContainer} ref={starsRef} />
        <canvas className={styles.canvas} ref={canvasDustRef} />
        <canvas className={styles.canvas} ref={canvasTrailsRef} />
      </div>
      <div className={styles.gridLayer} ref={gridRef} />
      <div className={clsx(styles.planetLayer, styles.breathing)} ref={planetLayerRef} />
    </div>
  );
}

export default SpaceBackground;
