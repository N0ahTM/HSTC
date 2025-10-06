import anime, { type AnimeInstance } from 'animejs';

interface StarfieldOptions {
  count?: number;
  twinkleSpeed?: number;
}

/**
 * Create animated starfield background.
 */
export function createStarfield(
  container: HTMLElement,
  options: StarfieldOptions = {}
): AnimeInstance[] {
  const { count = 100, twinkleSpeed = 4000 } = options;
  const animations: AnimeInstance[] = [];

  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.cssText = `
      position: absolute;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      background: #fff;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${0.2 + Math.random() * 0.3};
      pointer-events: none;
    `;
    container.appendChild(star);

    const animation = anime({
      targets: star,
      opacity: [0.2, 0.8],
      duration: twinkleSpeed + Math.random() * 3000,
      delay: Math.random() * 2000,
      direction: 'alternate',
      easing: 'easeInOutSine',
      loop: true
    });

    animations.push(animation);
  }

  return animations;
}

/**
 * Nebula pulse effect for background layers.
 */
export function nebulaPulse(element: HTMLElement, options: { duration?: number } = {}): AnimeInstance {
  const { duration = 12000 } = options;

  return anime({
    targets: element,
    opacity: [0.32, 0.5],
    duration,
    direction: 'alternate',
    easing: 'easeInOutSine',
    loop: true
  });
}

/**
 * Meteor trace animation (diagonal swoosh).
 */
export function createMeteor(container: HTMLElement): HTMLElement {
  const meteor = document.createElement('div');
  meteor.className = 'meteor';
  
  const startX = Math.random() * 100;
  const startY = -10;
  
  meteor.style.cssText = `
    position: absolute;
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,119,51,0.8), transparent);
    filter: blur(1px);
    left: ${startX}%;
    top: ${startY}%;
    transform: rotate(45deg);
    pointer-events: none;
    opacity: 0;
  `;

  container.appendChild(meteor);
  return meteor;
}

export function animateMeteor(meteor: HTMLElement, onComplete?: () => void): AnimeInstance {
  const distance = 150;

  return anime({
    targets: meteor,
    translateX: [`0vw`, `${distance}vw`],
    translateY: [`0vh`, `${distance}vh`],
    opacity: [0, 0.9, 0],
    duration: 2200,
    easing: 'easeInQuad',
    complete: () => {
      meteor.remove();
      onComplete?.();
    }
  });
}

/**
 * Scroll progress bar update.
 */
export function updateScrollProgress(bar: HTMLElement) {
  const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  
  anime.remove(bar);
  anime({
    targets: bar,
    width: `${Math.min(progress * 100, 100)}%`,
    duration: 160,
    easing: 'linear'
  });
}

