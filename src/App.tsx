import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { HeroSection } from '@/sections/HeroSection';
import { JoinSection } from '@/sections/JoinSection';
import { FooterSection } from '@/sections/FooterSection';
import { SpaceBackground } from '@/components/SpaceBackground';
import { useDiscordEvents } from '@/hooks/useDiscordEvents';
import { DiscordDataProvider } from '@/providers/DiscordDataProvider';

const CommunitySectionLazy = lazy(() =>
  import('@/sections/CommunitySection').then((module) => ({ default: module.CommunitySection }))
);
const CommunityImagesSectionLazy = lazy(() =>
  import('@/sections/CommunityImagesSection').then((module) => ({ default: module.CommunityImagesSection }))
);
const PillarsSectionLazy = lazy(() =>
  import('@/sections/PillarsSection').then((module) => ({ default: module.PillarsSection }))
);

const DISCORD_INVITE = 'https://discord.gg/jV8rByuJ4G';
const ORG_PROFILE_URL = 'https://robertsspaceindustries.com/orgs/HSTC';

export function App() {
  return (
    <DiscordDataProvider>
      <SiteShell />
    </DiscordDataProvider>
  );
}

function SiteShell() {
  const openDiscord = useCallback(() => {
    window.open(DISCORD_INVITE, '_blank', 'noopener,noreferrer');
  }, []);
  const openRecruitment = useCallback(() => {
    window.open(ORG_PROFILE_URL, '_blank', 'noopener,noreferrer');
  }, []);
  const discordEvents = useDiscordEvents();
  const hasAnyEvents =
    discordEvents.active.length > 0 || discordEvents.upcoming.length > 0 || discordEvents.past.length > 0;
  const showEventsSection = discordEvents.loading || hasAnyEvents;

  return (
    <>
      <SpaceBackground />
      <NavigationBar showCommunityLink={showEventsSection} />
      <main id="main">
        <HeroSection onJoin={openRecruitment} onDiscord={openDiscord} />
        <LazyVisibleSection placeholder={<SectionPlaceholder minHeight={520} />} rootMargin="0px 0px -12%">
          <Suspense fallback={<SectionPlaceholder minHeight={520} />}>
            <PillarsSectionLazy />
          </Suspense>
        </LazyVisibleSection>
        {showEventsSection && (
          <LazyVisibleSection placeholder={<SectionPlaceholder minHeight={480} />} rootMargin="0px 0px -15%">
            <Suspense fallback={<SectionPlaceholder minHeight={480} />}>
              <CommunitySectionLazy
                events={{
                  active: discordEvents.active,
                  upcoming: discordEvents.upcoming,
                  past: discordEvents.past,
                  loading: discordEvents.loading,
                  error: discordEvents.error,
                  guildId: discordEvents.guildId
                }}
              />
            </Suspense>
          </LazyVisibleSection>
        )}
        <LazyVisibleSection placeholder={<SectionPlaceholder minHeight={520} />} rootMargin="0px 0px -10%">
          <Suspense fallback={<SectionPlaceholder minHeight={520} />}>
            <CommunityImagesSectionLazy />
          </Suspense>
        </LazyVisibleSection>
        <JoinSection onJoin={openRecruitment} onDiscord={openDiscord} />
      </main>
      <FooterSection />
    </>
  );
}

interface LazyVisibleSectionProps {
  children: ReactNode;
  placeholder: ReactNode;
  rootMargin?: string;
}

function LazyVisibleSection({ children, placeholder, rootMargin = '0px 0px -20%' }: LazyVisibleSectionProps) {
  const [shouldRender, setShouldRender] = useState(
    () => typeof window === 'undefined' || typeof IntersectionObserver === 'undefined'
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender || typeof window === 'undefined') {
      return;
    }
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return <div ref={containerRef}>{shouldRender ? children : placeholder}</div>;
}

function SectionPlaceholder({ minHeight = 360 }: { minHeight?: number }) {
  return (
    <section className="section section-placeholder" aria-hidden="true">
      <div className="container" style={{ minHeight }} />
    </section>
  );
}
