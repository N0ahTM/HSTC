import { useEffect, useRef } from 'react';

import { YearBadge } from '@/components/YearBadge';
import { StatsBadge } from '@/components/StatsBadge';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { useDiscordStats } from '@/hooks/useDiscordStats';
import { useVerseYear } from '@/hooks/useVerseYear';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { playHeroIntro, startHeroLogoDrift, stopAnimations } from '@/motion/hero';
import { splitLetters, letterReveal } from '@/motion/textEffects';
import ResponsiveImage from '@/components/ResponsiveImage';

import type { AnimeInstance, AnimeTimelineInstance } from 'animejs';

import styles from './HeroSection.module.css';

interface HeroSectionProps {
  onJoin: () => void;
  onDiscord: () => void;
}

export function HeroSection({ onJoin, onDiscord }: HeroSectionProps) {
  const { foundationYear, verseYear, showRange } = useVerseYear();
  const { presenceCount, inVoice } = useDiscordStats();
  const prefersReducedMotion = usePrefersReducedMotion();

  const yearBadgeRef = useRef<HTMLElement | null>(null);
  const statsBadgeRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  // Hero intro timeline with letter-reveal
  useEffect(() => {
    const smallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    if (prefersReducedMotion || smallScreen) {
      return;
    }

    const animations: Array<AnimeInstance | AnimeTimelineInstance | null> = [];

    // Letter reveal for title
    if (titleRef.current && titleRef.current.textContent) {
      const chars = splitLetters(titleRef.current);
      animations.push(letterReveal(chars, { delay: 400, from: 'center' }));
    }

    // Standard timeline for other elements
    const timeline = playHeroIntro({
      badges: [yearBadgeRef.current, statsBadgeRef.current].filter(
        (node): node is HTMLElement => Boolean(node)
      ),
      logo: logoRef.current,
      title: null, // Skip, handled by letter reveal
      subtitle: subtitleRef.current,
      tagline: taglineRef.current,
      divider: dividerRef.current,
      actions: actionsRef.current
    });

    animations.push(timeline);

    const drift = startHeroLogoDrift(logoRef.current);
    if (drift) animations.push(drift);


    return () => {
      stopAnimations(...animations);
    };
  }, [prefersReducedMotion]);

  return (
    <section className={styles.hero} id="top">
      <YearBadge
        ref={yearBadgeRef}
        foundationYear={foundationYear}
        verseYear={verseYear}
        showRange={showRange}
      />
      <StatsBadge ref={statsBadgeRef} onlineMembers={presenceCount} inVoice={inVoice} />
      <div className={styles.content}>
        <ResponsiveImage
          ref={logoRef}
          src="/images/HSTC-Logo.webp"
          alt="HSTC Logo"
          className={styles.logo}
          loading="eager"
          decoding="async"
          width={1920}
          height={1663}
          fetchPriority="high"
          autoSize
        />
        <h1 ref={titleRef} className={styles.title}>
          HSTC
        </h1>
        <h2 ref={subtitleRef} className={styles.subtitle}>
          Helvetic Security &amp; Transport Corporation
        </h2>
        <div ref={dividerRef} className={styles.divider} aria-hidden="true" />
        <div ref={actionsRef} className={styles.actions}>
          <button className="btn" type="button" onClick={onJoin}>
            Jetzt beitreten
          </button>
          <button className="btn btn-outline" type="button" onClick={onDiscord}>
            Discord
          </button>
        </div>
      </div>
      <ScrollIndicator targetId="mission" label="Scroll für mehr" />
    </section>
  );
}
