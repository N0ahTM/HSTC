import { useEffect, useState } from 'react';

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

type DiscordStatsSnapshot = DiscordStats;

const widgetUrl = import.meta.env.VITE_DISCORD_WIDGET_URL ?? DEFAULT_WIDGET_URL;
let snapshot: DiscordStatsSnapshot = { presenceCount: null, inVoice: null, isLoading: true };
let inFlight: Promise<void> | null = null;
let intervalHandle: number | null = null;
let subscriberCount = 0;
let initialized = false;
const listeners = new Set<(value: DiscordStatsSnapshot) => void>();

function publish(next: DiscordStatsSnapshot) {
  snapshot = next;
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function readCache(): CachedStats | null {
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
}

function writeCache(presence: number, voice: number) {
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
}

async function fetchNetwork(): Promise<void> {
  if (inFlight) {
    return inFlight;
  }
  inFlight = (async () => {
    publish({ ...snapshot, isLoading: true, error: undefined });
    try {
      const response = await fetch(widgetUrl);
      if (!response.ok) {
        throw new Error(`Discord widget request failed: ${response.status}`);
      }
      const data = (await response.json()) as DiscordWidgetResponse;
      const presence = data.presence_count ?? 0;
      const voice = Array.isArray(data.members) ? data.members.filter((member) => Boolean(member.channel_id)).length : 0;
      writeCache(presence, voice);
      publish({ presenceCount: presence, inVoice: voice, isLoading: false, error: undefined });
    } catch (err) {
      console.error(err);
      const hasUsableData = snapshot.presenceCount !== null || snapshot.inVoice !== null;
      publish({
        ...snapshot,
        isLoading: false,
        error: hasUsableData ? undefined : 'Discord-Daten konnten nicht geladen werden.'
      });
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

function initializeStore() {
  if (initialized || typeof window === 'undefined') {
    return;
  }
  initialized = true;
  const cached = readCache();
  if (cached) {
    publish({
      presenceCount: cached.presenceCount,
      inVoice: cached.inVoice,
      isLoading: false,
      error: undefined
    });
  }
  void fetchNetwork();
  intervalHandle = window.setInterval(() => {
    void fetchNetwork();
  }, REFRESH_INTERVAL);
}

function subscribe(listener: (value: DiscordStatsSnapshot) => void) {
  listeners.add(listener);
  subscriberCount += 1;
  listener(snapshot);
  return () => {
    listeners.delete(listener);
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0 && intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
      intervalHandle = null;
      initialized = false;
    }
  };
}

export function useDiscordStats(): DiscordStats {
  const [state, setState] = useState<DiscordStatsSnapshot>(snapshot);

  useEffect(() => {
    initializeStore();
    return subscribe(setState);
  }, []);

  return state;
}
