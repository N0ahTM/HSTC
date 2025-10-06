import anime, { type AnimeInstance } from 'animejs';

/**
 * Animate filter transition with smart card detection:
 * - Fade out removed cards
 * - Fade in added cards
 * - Move existing cards to new positions
 */
export function filterTransition(
  beforeCards: HTMLElement[],
  afterCards: HTMLElement[],
  options: { onComplete?: () => void } = {}
) {
  const timeline = anime.timeline({
    easing: 'easeOutCubic',
    complete: options.onComplete
  });

  // Identify cards by their key/id
  const beforeIds = new Set(beforeCards.map((c) => c.getAttribute('data-card-id') || c.textContent?.slice(0, 20)));
  const afterIds = new Set(afterCards.map((c) => c.getAttribute('data-card-id') || c.textContent?.slice(0, 20)));

  const removed = beforeCards.filter(
    (c) => !afterIds.has(c.getAttribute('data-card-id') || c.textContent?.slice(0, 20))
  );
  const added = afterCards.filter(
    (c) => !beforeIds.has(c.getAttribute('data-card-id') || c.textContent?.slice(0, 20))
  );
  const existing = afterCards.filter((c) =>
    beforeIds.has(c.getAttribute('data-card-id') || c.textContent?.slice(0, 20))
  );

  // Phase 1: Fade out removed cards
  if (removed.length > 0) {
    timeline.add({
      targets: removed,
      opacity: [1, 0],
      scale: [1, 0.92],
      translateY: [0, 12],
      delay: anime.stagger(30),
      duration: 220
    });
  }

  // Phase 2: Move existing cards (if positions changed)
  if (existing.length > 0) {
    timeline.add(
      {
        targets: existing,
        translateY: [0, 0], // anime will auto-detect position change via FLIP
        duration: 340,
        easing: 'easeOutQuint'
      },
      removed.length > 0 ? '-=120' : 0
    );
  }

  // Phase 3: Fade in new cards
  if (added.length > 0) {
    // Set initial state
    added.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    });

    timeline.add(
      {
        targets: added,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(60),
        duration: 380
      },
      removed.length > 0 || existing.length > 0 ? '-=80' : 0
    );
  }

  return timeline;
}

/**
 * Create orbiting particle animation around a center point.
 */
export function createOrbit(
  particle: HTMLElement,
  pathId: string,
  options: { duration?: number; delay?: number } = {}
): AnimeInstance | null {
  const pathElement = document.querySelector<SVGPathElement>(pathId);
  if (!pathElement) {
    return null;
  }

  const { duration = 14000, delay = 0 } = options;
  const path = anime.path(pathElement);

  return anime({
    targets: particle,
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'),
    duration,
    delay,
    easing: 'linear',
    loop: true
  });
}

/**
 * Flash/pulse effect for value changes.
 */
export function flashValue(element: HTMLElement, options: { scale?: number; duration?: number } = {}) {
  const { scale = 1.12, duration = 450 } = options;

  return anime({
    targets: element,
    scale: [1, scale, 1],
    color: ['#fff', '#ff7733', '#fff'],
    duration,
    easing: 'easeOutCubic'
  });
}

/**
 * 3D tilt effect based on mouse position.
 */
export function apply3DTilt(card: HTMLElement, maxTilt = 8) {
  const handleMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / rect.height) * -maxTilt;
    const rotateY = ((e.clientX - centerX) / rect.width) * maxTilt;

    anime.remove(card);
    anime({
      targets: card,
      rotateX,
      rotateY,
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  const handleLeave = () => {
    anime.remove(card);
    anime({
      targets: card,
      rotateX: 0,
      rotateY: 0,
      duration: 400,
      easing: 'easeOutElastic(1, .6)'
    });
  };

  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', handleLeave);

  return () => {
    card.removeEventListener('mousemove', handleMove);
    card.removeEventListener('mouseleave', handleLeave);
  };
}

/**
 * Button press feedback animation.
 */
export function buttonPress(button: HTMLElement) {
  return anime
    .timeline({
      targets: button,
      easing: 'easeOutCubic'
    })
    .add({ scale: [1, 0.94], duration: 80 })
    .add({ scale: [0.94, 1.02], duration: 120 })
    .add({ scale: [1.02, 1], duration: 100 });
}
