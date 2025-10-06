import anime, { AnimeTimelineInstance, AnimeInstance } from 'animejs';

interface HeroElements {
  badges: HTMLElement[];
  logo?: HTMLElement | null;
  title?: HTMLElement | null;
  subtitle?: HTMLElement | null;
  tagline?: HTMLElement | null;
  divider?: HTMLElement | null;
  actions?: HTMLElement | null;
}

interface HeroIntroOptions {
  delay?: number;
}

export function playHeroIntro(elements: HeroElements, options: HeroIntroOptions = {}) {
  const timeline = anime.timeline({
    autoplay: false,
    easing: 'easeOutCubic'
  });

  if (elements.badges.length > 0) {
    timeline.add(
      {
        targets: elements.badges,
        opacity: [0, 1],
        translateY: [-16, 0],
        delay: anime.stagger(90),
        duration: 580
      },
      options.delay ?? 0
    );
  }

  if (elements.logo) {
    timeline.add(
      {
        targets: elements.logo,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 620
      },
      '-=320'
    );
  }

  if (elements.title) {
    timeline.add(
      {
        targets: elements.title,
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 520
      },
      '-=260'
    );
  }

  if (elements.subtitle) {
    timeline.add(
      {
        targets: elements.subtitle,
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 520
      },
      '-=360'
    );
  }

  if (elements.tagline) {
    timeline.add(
      {
        targets: elements.tagline,
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 480
      },
      '-=420'
    );
  }

  if (elements.divider) {
    timeline.add(
      {
        targets: elements.divider,
        opacity: [0, 1],
        scaleX: [0, 1],
        duration: 440,
        easing: 'easeOutBack'
      },
      '-=400'
    );
  }

  if (elements.actions) {
    timeline.add(
      {
        targets: elements.actions.querySelectorAll('button'),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(110),
        duration: 480
      },
      '-=360'
    );
  }

  timeline.play();

  return timeline;
}

export function startHeroLogoDrift(logo: HTMLElement | null) {
  if (!logo) {
    return null;
  }

  const animation = anime({
    targets: logo,
    scale: [1, 1.03],
    rotate: ['-1.2deg', '1.2deg'],
    duration: 8000,
    direction: 'alternate',
    easing: 'easeInOutSine',
    loop: true,
    autoplay: true
  });

  return animation as AnimeInstance;
}

export function stopAnimations(...instances: Array<AnimeInstance | AnimeTimelineInstance | null | undefined>) {
  instances.forEach((instance) => instance?.pause());
}
