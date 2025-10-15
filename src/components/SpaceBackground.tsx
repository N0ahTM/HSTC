import { useEffect, useMemo, useRef } from 'react';
import anime from 'animejs';
import clsx from 'clsx';
import styles from './SpaceBackground.module.css';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Vec2 = { x: number; y: number };

interface SpaceBackgroundProps {
  // Planet area is drawn above FX; by default we assume the screenshot framing
  // If you pass a circle, we will avoid spawning FX inside it to keep the planet clean
  planetCircle?: { cxPct: number; cyPct: number; rPct: number };
  // Show a red guide circle to adjust the mask visually
  showCircleGuide?: boolean;
  // Debug: color shooting stars bright red to inspect paths
  meteorDebug?: boolean;
}

export function SpaceBackground({ planetCircle, showCircleGuide, meteorDebug }: SpaceBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const canvasDustRef = useRef<HTMLCanvasElement>(null);
  const canvasTrailsRef = useRef<HTMLCanvasElement>(null);
  const canvasGuideRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const planetLayerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const circle = useMemo(() => {
    // Defaults based on your screenshot: center above viewport, large radius so only the arc is visible
    return planetCircle ?? { cxPct: 50, cyPct: -151, rPct: 110 };
  }, [planetCircle]);

  useEffect(() => {
    if (reduceMotion) return; // static background, no animations
    const root = rootRef.current!;
    const dustCanvas = canvasDustRef.current!;
    const trailsCanvas = canvasTrailsRef.current!;
  const grid = gridRef.current!;
    const planet = planetLayerRef.current!;

    let raf = 0;
    let running = true;

  // Resize canvases to device-pixel ratio for crispness
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function resize() {
      const { width, height } = root.getBoundingClientRect();
      for (const c of [dustCanvas, trailsCanvas, canvasGuideRef.current!]) {
        c.width = Math.floor(width * dpr);
        c.height = Math.floor(height * dpr);
        c.style.width = width + 'px';
        c.style.height = height + 'px';
      }
      // Revalidate star positions after resize to ensure none drift inside planet
      const starContainer = starsRef.current;
      if (starContainer && starContainer.children.length) {
        const elems = Array.from(starContainer.children) as HTMLElement[];
        for (const node of elems) {
          const leftPct = parseFloat(node.style.left);
          const topPct = parseFloat(node.style.top);
          let px = (leftPct / 100) * width;
          let py = (topPct / 100) * height;
          if (isInsidePlanet({ x: px, y: py })) {
            let tries = 0;
            let nx = Math.random() * 100;
            let ny = Math.random() * 100;
            while (tries < 80) {
              px = (nx / 100) * width;
              py = (ny / 100) * height;
              if (!isInsidePlanet({ x: px, y: py })) break;
              nx = Math.random() * 100;
              ny = Math.random() * 100;
              tries++;
            }
            if (tries < 80) {
              node.style.left = nx + '%';
              node.style.top = ny + '%';
            }
          }
        }
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // Helper: check if point is inside planet circle (in CSS pixels)
    function isInsidePlanet(p: Vec2): boolean {
      const rect = root.getBoundingClientRect();
      const cx = (circle.cxPct / 100) * rect.width;
      const cy = (circle.cyPct / 100) * rect.height;
      const r = (circle.rPct / 100) * Math.max(rect.width, rect.height);
      const dx = p.x - cx;
      const dy = p.y - cy;
      return dx * dx + dy * dy <= r * r;
    }

    // Stars (DOM nodes to leverage CSS filters and anime.js opacity easily)
  const starCount = 260; // more stars
  const starNodes: HTMLElement[] = [];
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('span');
      star.style.position = 'absolute';
      const size = 0.6 + Math.pow(Math.random(), 2.6) * 2.0; // bias to smaller
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.borderRadius = '50%';
      // subtle color variety near white
      const r = Math.random();
      let color: string;
      if (r < 0.6) {
        // cool/neutral whites
        color = `hsl(${210 + Math.random() * 20}, 40%, ${80 + Math.random() * 18}%)`;
      } else if (r < 0.9) {
        // warm/yellowish
        color = `hsl(${38 + Math.random() * 12}, 60%, ${78 + Math.random() * 16}%)`;
      } else {
        // very few reddish dwarfs
        color = `hsl(${8 + Math.random() * 6}, 70%, ${72 + Math.random() * 14}%)`;
      }
      star.style.background = color;

      // Reject positions that fall inside the planet
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      let tries = 0;
      while (tries < 80) {
        const px = (x / 100) * root.clientWidth;
        const py = (y / 100) * root.clientHeight;
        if (!isInsidePlanet({ x: px, y: py })) break;
        x = Math.random() * 100;
        y = Math.random() * 100;
        tries++;
      }
      if (tries >= 80) { i--; continue; }
      star.style.left = x + '%';
      star.style.top = y + '%';
      star.style.opacity = String(0.35 + Math.random() * 0.55);
      star.style.filter = `blur(${Math.random() < 0.3 ? 0.6 : 0}px)`;
      star.style.pointerEvents = 'none';
      starsRef.current!.appendChild(star);
      starNodes.push(star);
    }

    const starTweens = starNodes.map((n) =>
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

    // Dust and nebula: soft moving particles, slight parallax drift
    type Dust = { x: number; y: number; r: number; a: number; vx: number; vy: number; hue: number };
    const dustCtx = dustCanvas.getContext('2d')!;
    const dustCount = 180; // subtle many tiny dust particles
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
          hue: 12 + Math.random() * 10,
        };
        guard++;
      } while (isInsidePlanet(p) && guard < 10);
      return p;
    }
    for (let i = 0; i < dustCount; i++) dust.push(spawnDust());

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
        if (isInsidePlanet({ x: px, y: py })) return true;
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
      } while ((tries < 40) && (Math.hypot(B.x - A.x, B.y - A.y) < rect.width * 0.3 || pathTouchesPlanet(A, B) || isInsidePlanet(A) || isInsidePlanet(B)));
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
      const clipCx = (circle.cxPct / 100) * root.clientWidth * rx;
      const clipCy = (circle.cyPct / 100) * root.clientHeight * ry;
      const clipR = (circle.rPct / 100) * Math.max(root.clientWidth, root.clientHeight) * dpr;
      dustCtx.save();
      dustCtx.beginPath();
      dustCtx.rect(0, 0, rectW, rectH);
      dustCtx.moveTo(clipCx + clipR, clipCy);
      dustCtx.arc(clipCx, clipCy, clipR, 0, Math.PI * 2);
      dustCtx.clip('evenodd');
      for (const d of dust) {
        d.x += d.vx + wind.x * 0.6; 
        d.y += d.vy + wind.y * 0.6;
        if (isInsidePlanet(d)) { d.x -= d.vx * 2; d.y -= d.vy * 2; }
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

      // Guide circle overlay (red) when requested
      const guide = canvasGuideRef.current!;
      const gctx = guide.getContext('2d')!;
      gctx.clearRect(0, 0, guide.width, guide.height);
      if (showCircleGuide) {
        const rect = root.getBoundingClientRect();
        const cx = (circle.cxPct / 100) * rect.width * rx;
        const cy = (circle.cyPct / 100) * rect.height * ry;
        const r = (circle.rPct / 100) * Math.max(rect.width, rect.height) * dpr;
        gctx.save();
        gctx.strokeStyle = 'rgba(255,0,0,0.9)';
        gctx.lineWidth = 2 * dpr;
        gctx.setLineDash([6 * dpr, 6 * dpr]);
        gctx.beginPath();
        gctx.arc(cx, cy, r, 0, Math.PI * 2);
        gctx.stroke();
        // crosshair
        gctx.setLineDash([]);
        gctx.globalAlpha = 0.6;
        gctx.beginPath(); gctx.moveTo(cx - 10 * dpr, cy); gctx.lineTo(cx + 10 * dpr, cy); gctx.stroke();
        gctx.beginPath(); gctx.moveTo(cx, cy - 10 * dpr); gctx.lineTo(cx, cy + 10 * dpr); gctx.stroke();
        gctx.restore();
      }

      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      starNodes.forEach((n) => n.remove());
      anime.remove(starNodes);
      gridTween.pause();
      planetTween.pause();
      document.removeEventListener('visibilitychange', onVisibility);
    // no engine trails timer to clear
    };
  }, [circle.cxPct, circle.cyPct, circle.rPct, reduceMotion, meteorDebug]);

  // Draw guide even when reduced motion is enabled
  useEffect(() => {
    if (!showCircleGuide) return;
  const root = rootRef.current;
  const guide = canvasGuideRef.current;
  if (!root || !guide) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function drawGuide() {
  const rect = root!.getBoundingClientRect();
  guide!.width = Math.floor(rect.width * dpr);
  guide!.height = Math.floor(rect.height * dpr);
  guide!.style.width = rect.width + 'px';
  guide!.style.height = rect.height + 'px';

  const gctx = guide!.getContext('2d');
      if (!gctx) return;
  gctx.clearRect(0, 0, guide!.width, guide!.height);

  const rx = guide!.width / rect.width;
  const ry = guide!.height / rect.height;
      const cx = (circle.cxPct / 100) * rect.width * rx;
      const cy = (circle.cyPct / 100) * rect.height * ry;
      const r = (circle.rPct / 100) * Math.max(rect.width, rect.height) * dpr;
      gctx.save();
      gctx.strokeStyle = 'rgba(255,0,0,0.9)';
      gctx.lineWidth = 2 * dpr;
      gctx.setLineDash([6 * dpr, 6 * dpr]);
      gctx.beginPath();
      gctx.arc(cx, cy, r, 0, Math.PI * 2);
      gctx.stroke();
      gctx.setLineDash([]);
      gctx.globalAlpha = 0.6;
      gctx.beginPath(); gctx.moveTo(cx - 10 * dpr, cy); gctx.lineTo(cx + 10 * dpr, cy); gctx.stroke();
      gctx.beginPath(); gctx.moveTo(cx, cy - 10 * dpr); gctx.lineTo(cx, cy + 10 * dpr); gctx.stroke();
      gctx.restore();
    }

    const ro = new ResizeObserver(() => drawGuide());
    ro.observe(root);
    drawGuide();

    return () => ro.disconnect();
  }, [showCircleGuide, circle.cxPct, circle.cyPct, circle.rPct]);

  return (
    <div className={clsx(styles.root)} ref={rootRef} aria-hidden>
      <div className={styles.fxLayer}>
        <div className={styles.starsContainer} ref={starsRef} />
        <canvas className={styles.canvas} ref={canvasDustRef} />
        <canvas className={styles.canvas} ref={canvasTrailsRef} />
        <canvas className={styles.guideCanvas} ref={canvasGuideRef} />
      </div>
      <div className={styles.gridLayer} ref={gridRef} />
      <div className={clsx(styles.planetLayer, styles.breathing)} ref={planetLayerRef} />
    </div>
  );
}

export default SpaceBackground;
