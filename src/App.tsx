import { useCallback } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { HeroSection } from '@/sections/HeroSection';
import { PillarsSection } from '@/sections/PillarsSection';
import { CommunitySection } from '@/sections/CommunitySection';
import { CommunityImagesSection } from '@/sections/CommunityImagesSection';
import { JoinSection } from '@/sections/JoinSection';
import { FooterSection } from '@/sections/FooterSection';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SpaceBackground } from '@/components/SpaceBackground';

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
  usePrefersReducedMotion();

  return (
    <>
  <SpaceBackground showCircleGuide={false} />
  <NavigationBar />
      <main>
        <HeroSection onJoin={openRecruitment} onDiscord={openDiscord} />
        <PillarsSection />
        <CommunitySection />
        <CommunityImagesSection />
        <JoinSection onJoin={openRecruitment} onDiscord={openDiscord} />
      </main>
      <FooterSection />
    </>
  );
}
