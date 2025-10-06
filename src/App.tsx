import { useCallback, useEffect } from 'react';
import anime, { type AnimeInstance } from 'animejs';
import { NavigationBar } from '@/components/NavigationBar';
import { ScrollProgress } from '@/components/ScrollProgress';
import { DiscordSection } from '@/sections/DiscordSection';
import { HeroSection } from '@/sections/HeroSection';
import { PillarsSection } from '@/sections/PillarsSection';
import { OperationsSection } from '@/sections/OperationsSection';
import { CommunitySection } from '@/sections/CommunitySection';
import { JoinSection } from '@/sections/JoinSection';
import { FooterSection } from '@/sections/FooterSection';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { createStarfield, nebulaPulse, createMeteor, animateMeteor } from '@/motion/ambient';

const DISCORD_INVITE = 'https://discord.gg/jV8rByuJ4G';
const ORG_PROFILE_URL = 'https://robertsspaceindustries.com/orgs/HSTC';

export function App() {
  return <SiteShell />;
}

function SiteShell() {
  const openDiscord = useCallback(() => {
    window.open(DISCORD_INVITE, '_blank', 'noopener');
  }, []);
  const openRecruitment = useCallback(() => {
    window.open(ORG_PROFILE_URL, '_blank', 'noopener');
  }, []);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const animations: AnimeInstance[] = [];
    const space = document.querySelector<HTMLElement>('.background-space');
    const grid = document.querySelector<HTMLElement>('.background-grid');

    // Starfield
    if (space) {
      const starAnimations = createStarfield(space, { count: 60, twinkleSpeed: 5000 });
      animations.push(...starAnimations);
    }

    // Nebula pulse
    if (space) {
      animations.push(nebulaPulse(space, { duration: 14000 }));
    }

    if (grid) {
      animations.push(
        anime({
          targets: grid,
          opacity: [0.24, 0.36],
          duration: 16000,
          direction: 'alternate',
          easing: 'easeInOutSine',
          loop: true
        })
      );
    }

    // Occasional meteor
    const spawnMeteor = () => {
      if (!space || prefersReducedMotion) return;
      
      const meteor = createMeteor(space);
      animateMeteor(meteor);
      
      setTimeout(spawnMeteor, 30000 + Math.random() * 20000);
    };
    
    const meteorTimeout = setTimeout(spawnMeteor, 8000);

    return () => {
      animations.forEach((instance) => instance.pause());
      clearTimeout(meteorTimeout);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <ScrollProgress />
      <div className="background-space" aria-hidden="true" />
      <div className="background-grid" aria-hidden="true" />
      <NavigationBar onJoin={openRecruitment} onDiscord={openDiscord} />
      <main>
        <HeroSection onJoin={openRecruitment} onDiscord={openDiscord} />
        <PillarsSection />
        <OperationsSection />
        <CommunitySection />
        <DiscordSection onJoinClick={openDiscord} />
        <JoinSection onJoin={openRecruitment} onDiscord={openDiscord} />
      </main>
      <FooterSection />
    </>
  );
}
