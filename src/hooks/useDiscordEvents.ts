import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDiscordEventsEndpoint } from '@/config/amplifyOutputs';

export interface DiscordCommunityEvent {
  id: string;
  name: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  type: 'STAGE' | 'VOICE' | 'EXTERNAL' | 'UNKNOWN';
  location?: string;
  imageUrl?: string;
  userCount?: number;
  isPast: boolean;
  isUpcoming: boolean;
  isActive: boolean;
}

interface EventsEnvelope {
  payload: {
    generatedAt: string;
    guildId: string;
    upcoming: DiscordCommunityEvent[];
    active: DiscordCommunityEvent[];
    past: DiscordCommunityEvent[];
    rawCount: number;
  };
  meta: { cache: 'HIT' | 'MISS' | 'STALE' };
}

export interface UseDiscordEventsResult {
  upcoming: DiscordCommunityEvent[];
  active: DiscordCommunityEvent[];
  past: DiscordCommunityEvent[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  metaCache?: string;
  generatedAt?: string;
}

export function useDiscordEvents(): UseDiscordEventsResult {
  const [upcoming, setUpcoming] = useState<DiscordCommunityEvent[]>([]);
  const [active, setActive] = useState<DiscordCommunityEvent[]>([]);
  const [past, setPast] = useState<DiscordCommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [cacheState, setCacheState] = useState<string | undefined>();
  const [generatedAt, setGeneratedAt] = useState<string | undefined>();

  const abortRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(undefined);
    try {
      const endpoint = await getDiscordEventsEndpoint();
      const base = endpoint.startsWith('http') || typeof window === 'undefined' ? endpoint : `${window.location.origin.replace(/\/$/, '')}${endpoint}`;
      const response = await fetch(base, { method: 'GET', cache: 'no-store', signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Events request failed: ${response.status}`);
      }
      const json = (await response.json()) as EventsEnvelope;
      setUpcoming(json.payload.upcoming);
      setActive(json.payload.active);
      setPast(json.payload.past);
      setCacheState(json.meta?.cache);
      setGeneratedAt(json.payload.generatedAt);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Events konnten nicht geladen werden.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    void fetchEvents();
    return () => abortRef.current?.abort();
  }, [fetchEvents]);

  return useMemo(
    () => ({ upcoming, active, past, loading, error, refresh, metaCache: cacheState, generatedAt }),
    [upcoming, active, past, loading, error, refresh, cacheState, generatedAt]
  );
}
