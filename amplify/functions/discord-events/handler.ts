import { setTimeout as sleep } from 'node:timers/promises';

// Discord API constants
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const CACHE_TTL_MS = 300_000; // 5 Minuten
const MAX_RETRIES = 2;

// CORS Headers (Function URL steuert Origin selbst)
const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type, Origin, Referer, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Type, Content-Length',
  Vary: 'Origin'
};

type LambdaEvent = {
  readonly requestContext: { readonly http: { readonly method: string } };
  readonly queryStringParameters?: Record<string, string | undefined>;
};

type LambdaResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

// Discord Event Types (subset)
interface DiscordScheduledEvent {
  id: string;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time?: string | null;
  status: number; // 1 = SCHEDULED, 2 = ACTIVE, 3 = COMPLETED, 4 = CANCELED
  entity_type: number; // 1 = STAGE_INSTANCE, 2 = VOICE, 3 = EXTERNAL
  entity_id?: string | null;
  entity_metadata?: {
    location?: string | null;
  } | null;
  user_count?: number;
  image?: string | null;
  privacy_level?: number; // 2 = GUILD_ONLY
}

interface NormalizedEvent {
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

interface EventsPayload {
  generatedAt: string;
  guildId: string;
  upcoming: NormalizedEvent[]; // startsAt > now && not canceled
  active: NormalizedEvent[]; // status ACTIVE
  past: NormalizedEvent[]; // completed or ended < now
  rawCount: number;
  // optional combined view (only when requested via ?all=1)
  all?: Array<NormalizedEvent & { bucket: 'upcoming' | 'active' | 'past' }>; 
}

interface CacheEntry {
  payload: EventsPayload;
  expiresAt: number;
  fetchedAt: string;
}

const memoryCache = new Map<string, CacheEntry>();

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.requestContext.http.method !== 'GET') {
    return errorResponse(405, 'Method Not Allowed');
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!token || !guildId) {
    const missing: string[] = [];
    if (!token) missing.push('DISCORD_BOT_TOKEN');
    if (!guildId) missing.push('DISCORD_GUILD_ID');
    console.error('Missing Discord events configuration', { missing });
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Discord configuration missing.',
        missingEnv: missing,
        hint: 'Set secrets (Amplify) or local .env variables before invoking.'
      })
    };
  }

  const debug = event.queryStringParameters?.debug === '1';
  const includeRaw = debug && event.queryStringParameters?.raw === '1';
  const wantAll = event.queryStringParameters?.all === '1';
  const cacheKey = guildId;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return successResponse(cached.payload, 'HIT', debug ? { cacheKey, source: 'memory' } : undefined);
  }

  let payload: EventsPayload | null = null;
  let lastEvents: DiscordScheduledEvent[] | undefined;
  try {
  const { events, debugInfo } = await fetchScheduledEvents(guildId, token, debug);
  lastEvents = events;
  payload = buildPayload(guildId, events, wantAll);
    memoryCache.set(cacheKey, {
      payload,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + CACHE_TTL_MS
    });
    console.info('discord-events fetched', {
      guildId,
      total: payload.rawCount,
      upcoming: payload.upcoming.length,
      active: payload.active.length,
      past: payload.past.length,
      debugInfo
    });
  } catch (err) {
    console.error('discord-events fetch failed', {
      guildId,
      error: err instanceof Error ? { message: err.message } : err
    });
    if (cached) {
      return successResponse(cached.payload, 'STALE', debug ? { cacheKey, source: 'stale-cache' } : undefined);
    }
    return {
      statusCode: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch Discord events' })
    };
  }

  return successResponse(payload, 'MISS', debug ? { cacheKey, ...(includeRaw && lastEvents ? { rawEvents: lastEvents } : {}) } : undefined);
}

function successResponse(payload: EventsPayload, cache: 'HIT' | 'MISS' | 'STALE', extra?: Record<string, unknown>): LambdaResponse {
  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, meta: { cache, ...extra } })
  };
}

function errorResponse(statusCode: number, message: string): LambdaResponse {
  return {
    statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message })
  };
}

interface FetchDebugInfo {
  status?: number;
  count?: number;
  rateLimitRemaining?: string | null;
  failingStatus?: number;
  failingBodySnippet?: string;
  attempts: number;
}

async function fetchScheduledEvents(
  guildId: string,
  token: string,
  debug: boolean
): Promise<{ events: DiscordScheduledEvent[]; debugInfo?: FetchDebugInfo }> {
  const url = new URL(`${DISCORD_API_BASE}/guilds/${guildId}/scheduled-events`);
  // with_user_count=true liefert user_count
  url.searchParams.set('with_user_count', 'true');

  let attempt = 0;
  let lastError: unknown;
  let failingStatus: number | undefined;
  let failingBodySnippet: string | undefined;
  while (attempt <= MAX_RETRIES) {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bot ${token}` }
    });
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const delay = retryAfter ? Number.parseFloat(retryAfter) * 1000 : 1000;
      await sleep(delay);
      attempt += 1;
      continue;
    }
    if (!response.ok) {
      failingStatus = response.status;
      try {
        const text = await response.text();
        failingBodySnippet = text.slice(0, 200);
      } catch {
        // ignore
      }
      lastError = new Error(`Discord responded ${response.status}`);
    } else {
      const data = (await response.json()) as DiscordScheduledEvent[];
      return {
        events: data,
        debugInfo: debug
          ? {
              status: response.status,
              count: data.length,
              rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
              attempts: attempt + 1
            }
          : undefined
      };
    }
    await sleep(200 * (attempt + 1));
    attempt += 1;
  }
  const err = lastError instanceof Error ? lastError : new Error('Discord events fetch failed');
  if (debug) {
    return Promise.reject(
      Object.assign(err, {
        debugInfo: {
          failingStatus,
            failingBodySnippet,
          attempts: attempt + 1
        }
      })
    );
  }
  throw err;
}

function buildPayload(guildId: string, events: DiscordScheduledEvent[], wantAll: boolean): EventsPayload {
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const normalized: NormalizedEvent[] = events.map((e) => normalizeEvent(e, nowMs));
  const upcoming = normalized.filter((e) => e.isUpcoming && !e.isActive);
  const active = normalized.filter((e) => e.isActive);
  const past = normalized.filter((e) => e.isPast);
  const base: EventsPayload = {
    generatedAt: nowIso,
    guildId,
    upcoming: sortByStart(upcoming),
    active: sortByStart(active),
    past: sortByStartDesc(past),
    rawCount: events.length
  };
  if (wantAll) {
    base.all = [
      ...base.upcoming.map((e) => ({ ...e, bucket: 'upcoming' as const })),
      ...base.active.map((e) => ({ ...e, bucket: 'active' as const })),
      ...base.past.map((e) => ({ ...e, bucket: 'past' as const }))
    ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  return base;
}

function sortByStart(list: NormalizedEvent[]): NormalizedEvent[] {
  return [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
function sortByStartDesc(list: NormalizedEvent[]): NormalizedEvent[] {
  return [...list].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

function normalizeEvent(ev: DiscordScheduledEvent, nowMs: number): NormalizedEvent {
  const startMs = Date.parse(ev.scheduled_start_time);
  const endMs = ev.scheduled_end_time ? Date.parse(ev.scheduled_end_time) : undefined;
  const status = toStatus(ev.status);
  const type = toType(ev.entity_type);
  const hash = ev.image;
  const imageUrl = hash ? `https://cdn.discordapp.com/guild-events/${ev.id}/${hash}.png?size=512` : undefined;
  const isActive = status === 'ACTIVE';
  const hasEnded = !!endMs && endMs < nowMs;
  // Edge case handling: If an event's scheduled start time is in the past but it was never started
  // (status still SCHEDULED) Discord may leave it as SCHEDULED indefinitely. We classify it as past
  // so it does not disappear from all buckets.
  const isStaleScheduled = !isActive && status === 'SCHEDULED' && startMs < nowMs;
  const isPast = status === 'COMPLETED' || status === 'CANCELED' || hasEnded || isStaleScheduled;
  const isUpcoming = !isActive && !isPast && startMs > nowMs && status === 'SCHEDULED';
  return {
    id: ev.id,
    name: ev.name,
    description: ev.description ?? undefined,
    startsAt: ev.scheduled_start_time,
    endsAt: ev.scheduled_end_time ?? undefined,
    status,
    type,
    location: ev.entity_metadata?.location ?? undefined,
    imageUrl,
    userCount: ev.user_count,
    isPast,
    isUpcoming,
    isActive
  };
}

function toStatus(code: number): NormalizedEvent['status'] {
  switch (code) {
    case 1:
      return 'SCHEDULED';
    case 2:
      return 'ACTIVE';
    case 3:
      return 'COMPLETED';
    case 4:
      return 'CANCELED';
    default:
      return 'SCHEDULED';
  }
}
function toType(code: number): NormalizedEvent['type'] {
  switch (code) {
    case 1:
      return 'STAGE';
    case 2:
      return 'VOICE';
    case 3:
      return 'EXTERNAL';
    default:
      return 'UNKNOWN';
  }
}
