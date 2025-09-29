import { useCallback } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { DiscordSection } from '@/sections/DiscordSection';
import { HeroSection } from '@/sections/HeroSection';
import { PillarsSection } from '@/sections/PillarsSection';
import { OperationsSection } from '@/sections/OperationsSection';
import { CommunitySection } from '@/sections/CommunitySection';
import { JoinSection } from '@/sections/JoinSection';
import { FooterSection } from '@/sections/FooterSection';

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

  return (
    <>
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
