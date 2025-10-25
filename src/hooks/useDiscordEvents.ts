import { useDiscordData, type DiscordCommunityEvent } from '@/providers/DiscordDataProvider';

export type { DiscordCommunityEvent } from '@/providers/DiscordDataProvider';

export interface UseDiscordEventsResult {
  upcoming: DiscordCommunityEvent[];
  active: DiscordCommunityEvent[];
  past: DiscordCommunityEvent[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  metaCache?: 'HIT' | 'MISS' | 'STALE';
  generatedAt?: string;
  guildId?: string;
  totalCount?: number;
}

export function useDiscordEvents(): UseDiscordEventsResult {
  const { events, refresh } = useDiscordData();
  return {
    upcoming: events.upcoming,
    active: events.active,
    past: events.past,
    loading: events.loading,
    error: events.error,
    refresh,
    metaCache: events.metaCache,
    generatedAt: events.generatedAt,
    guildId: events.guildId,
    totalCount: events.totalCount
  };
}
