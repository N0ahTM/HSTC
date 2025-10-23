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
import { useDiscordEvents } from '@/hooks/useDiscordEvents';

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
  const discordEvents = useDiscordEvents();
  const hasAnyEvents =
    discordEvents.active.length > 0 || discordEvents.upcoming.length > 0 || discordEvents.past.length > 0;
  const showEventsSection = discordEvents.loading || hasAnyEvents;

  return (
    <>
      <SpaceBackground />
      <NavigationBar showCommunityLink={showEventsSection} />
      <main>
        <HeroSection onJoin={openRecruitment} onDiscord={openDiscord} />
        <PillarsSection />
        {showEventsSection && (
          <CommunitySection
            events={{
              active: discordEvents.active,
              upcoming: discordEvents.upcoming,
              past: discordEvents.past,
              loading: discordEvents.loading,
              error: discordEvents.error,
              guildId: discordEvents.guildId
            }}
          />
        )}
        <CommunityImagesSection />
        <JoinSection onJoin={openRecruitment} onDiscord={openDiscord} />
      </main>
      <FooterSection />
    </>
  );
}
