import anime from 'animejs';
const highlightedInit = new WeakSet<HTMLElement>();

/**
 * Smoothly animate horizontal scrollLeft to a target.
 */
export function animateScrollTo(
  el: HTMLElement,
  targetLeft: number,
  options: { duration?: number; easing?: string; onComplete?: () => void } = {}
) {
  const { duration = 500, easing = 'easeOutCubic', onComplete } = options;
  anime.remove(el);
  // Ensure snap disabled during animated transition (will be restored after)
  const previousInline = el.style.scrollSnapType;
  el.style.scrollSnapType = 'none';
  return anime({
    targets: el,
    scrollLeft: targetLeft,
    duration,
    easing,
    complete: () => {
      // Restore (remove inline override so CSS class applies)
      if (previousInline) {
        el.style.scrollSnapType = previousInline;
      } else {
        el.style.removeProperty('scroll-snap-type');
      }
      if (onComplete) {
        onComplete();
      }
    }
  });
}

/**
 * Highlight the active card (visual focus) and dim others using filter + shadow
 * (non-destructive to existing transform tilt effects).
 */
export function highlightActiveCard(
  cards: HTMLElement[],
  activeIndex: number,
  options: { reducedMotion?: boolean } = {}
) {
  if (!cards.length) return; // nothing
  const { reducedMotion } = options;
  const active = cards[activeIndex];
  const inactive = cards.filter((_, i) => i !== activeIndex);

  if (!active) return;

  // Prepare base styles if first run
  if (!highlightedInit.has(active)) {
    cards.forEach((c) => {
      c.style.transition = 'filter .4s ease, box-shadow .5s ease';
      c.style.filter ||= 'brightness(.82)';
    });
    highlightedInit.add(active);
  }

  if (reducedMotion) {
    cards.forEach((c, i) => {
      c.style.filter = i === activeIndex ? 'brightness(1)' : 'brightness(.78)';
      c.style.boxShadow = i === activeIndex
        ? '0 4px 22px -4px rgba(255,190,60,.35)'
        : 'var(--shadow-md)';
    });
    return;
  }

  anime.remove(cards);
  anime({
    targets: inactive,
    filter: 'brightness(.72)',
    boxShadow: 'var(--shadow-md)',
    duration: 420,
    easing: 'easeOutCubic'
  });
  anime({
    targets: active,
    filter: 'brightness(1)',
    boxShadow: '0 4px 26px -2px rgba(255,190,60,.42)',
    duration: 520,
    easing: 'easeOutQuint'
  });
}

/**
 * Compute nearest child article's offsetLeft to snap to.
 */
export function nearestSnapLeft(container: HTMLElement): number | null {
  const children = Array.from(container.querySelectorAll<HTMLElement>('article'));
  if (!children.length) return null;
  const current = container.scrollLeft;
  // Bias: If close to first (within 38% of first card width) always snap to first
  const first = children[0];
  if (first) {
    const firstWidth = first.offsetWidth + parseFloat(getComputedStyle(first).marginRight || '0');
    if (current < firstWidth * 0.38) return 0; // snap to first
  }
  let best: { left: number; dist: number } | null = null;
  for (const child of children) {
    const left = child.offsetLeft;
    const dist = Math.abs(left - current);
    if (!best || dist < best.dist) best = { left, dist };
  }
  return best ? best.left : null;
}

/**
 * Debounced snap after scroll interaction.
 */
export function scheduleSnap(
  container: HTMLElement,
  state: { timer: number | null },
  delay = 140,
  options: { reducedMotion?: boolean } = {}
) {
  if (state.timer) window.clearTimeout(state.timer);
  state.timer = window.setTimeout(() => {
    const target = nearestSnapLeft(container);
    if (target != null) {
      // Ensure snap is disabled before animating to target (in case inertia still active)
      const prev = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      animateScrollTo(container, target, {
        duration: options.reducedMotion ? 0 : 420,
        easing: 'easeOutCubic'
      });
      // animateScrollTo itself will restore snap afterwards. If reduced motion, restore immediately
      if (options.reducedMotion) {
        if (prev) container.style.scrollSnapType = prev; else container.style.removeProperty('scroll-snap-type');
      }
    }
  }, delay);
}
