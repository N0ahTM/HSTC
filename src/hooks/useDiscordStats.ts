import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface DiscordMember {
  channel_id?: string;
}

interface DiscordWidgetResponse {
  presence_count?: number;
  members?: DiscordMember[];
}

export interface DiscordStats {
  presenceCount: number | null;
  inVoice: number | null;
  isLoading: boolean;
  error?: string;
}

const DEFAULT_WIDGET_URL = 'https://discord.com/api/guilds/628996745837150211/widget.json';
const REFRESH_INTERVAL = 300_000;
const CACHE_KEY = 'hstc.discord.widget';
const CACHE_TTL = 300_000;

interface CachedStats {
  presenceCount: number;
  inVoice: number;
  timestamp: number;
}

export function useDiscordStats(): DiscordStats {
  const [presenceCount, setPresenceCount] = useState<number | null>(null);
  const [inVoice, setInVoice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const controllerRef = useRef<AbortController | null>(null);

  const widgetUrl = useMemo(
    () => import.meta.env.VITE_DISCORD_WIDGET_URL ?? DEFAULT_WIDGET_URL,
    [],
  );

  const readCache = useCallback((): CachedStats | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedStats;
      if (typeof parsed.timestamp !== 'number') return null;
      if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
      if (typeof parsed.presenceCount !== 'number' || typeof parsed.inVoice !== 'number') {
        return null;
      }
      return parsed;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const writeCache = useCallback((presence: number, voice: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    const payload: CachedStats = {
      presenceCount: presence,
      inVoice: voice,
      timestamp: Date.now()
    };
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const load = useCallback(
    async (mode: 'cache-first' | 'network' = 'network'): Promise<boolean> => {
      if (mode === 'cache-first') {
        const cached = readCache();
        if (cached) {
          setPresenceCount(cached.presenceCount);
          setInVoice(cached.inVoice);
          setIsLoading(false);
          return true;
        }
      }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch(widgetUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Discord widget request failed: ${response.status}`);
      }
      const data = (await response.json()) as DiscordWidgetResponse;
      const presence = data.presence_count ?? 0;
      const voice = Array.isArray(data.members)
        ? data.members.filter((member) => Boolean(member.channel_id)).length
        : 0;

      setPresenceCount(presence);
      setInVoice(voice);
      writeCache(presence, voice);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error(err);
        setError('Discord-Daten konnten nicht geladen werden.');
      }
    } finally {
      setIsLoading(false);
    }
      return false;
    },
    [readCache, widgetUrl, writeCache],
  );

  useEffect(() => {
    let isMounted = true;

    load('cache-first').then((usedCache) => {
      if (usedCache && isMounted) {
        void load('network');
      }
    });

    const interval = window.setInterval(() => {
      void load('network');
    }, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      controllerRef.current?.abort();
      window.clearInterval(interval);
    };
  }, [load]);

  return {
    presenceCount,
    inVoice,
    isLoading,
    error
  };
}
