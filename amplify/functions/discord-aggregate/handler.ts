import { setTimeout as sleep } from 'node:timers/promises';
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const CACHE_TTL_MS = 300_000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 25;
const MAX_RETRIES = 2;

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type, Origin, Referer, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Type, Content-Length',
  Vary: 'Origin'
};

const successHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
};

const errorHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, max-age=0'
};

type CacheState = 'MISS' | 'HIT' | 'STALE';
type Mode = 'both' | 'events' | 'images';

type LambdaEvent = {
  readonly requestContext: { readonly http: { readonly method: string } };
  readonly headers?: Record<string, string | undefined>;
  readonly queryStringParameters?: Record<string, string | undefined>;
};

type LambdaResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

interface DiscordAuthor {
  id: string;
  username?: string;
  global_name?: string;
  avatar?: string | null;
}

interface DiscordAttachment {
  id: string;
  filename: string;
  url: string;
  proxy_url?: string;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
}

interface DiscordEmbedImage {
  url?: string;
  proxy_url?: string;
  width?: number | null;
  height?: number | null;
}

interface DiscordEmbed {
  type?: string;
  url?: string;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedImage;
}

interface DiscordMessage {
  id: string;
  author: DiscordAuthor;
  timestamp: string;
  attachments?: DiscordAttachment[];
  embeds?: DiscordEmbed[];
}

export interface DiscordImageItem {
  id: string;
  attachmentId: string;
  imageUrl: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface DiscordImagesPayload {
  data: DiscordImageItem[];
  page: {
    nextBefore?: string;
    hasMore: boolean;
  };
}

interface CombinedImagesBlock extends DiscordImagesPayload {
  meta: {
    fetchedAt: string;
    cache: CacheState;
  };
}

interface DiscordScheduledEvent {
  id: string;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time?: string | null;
  status: number;
  entity_type: number;
  entity_metadata?: {
    location?: string | null;
  } | null;
  user_count?: number;
  image?: string | null;
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
  upcoming: NormalizedEvent[];
  active: NormalizedEvent[];
  past: NormalizedEvent[];
  rawCount: number;
  all?: Array<NormalizedEvent & { bucket: 'upcoming' | 'active' | 'past' }>;
}

interface CombinedResponse {
  events?: EventsPayload;
  images?: CombinedImagesBlock;
  meta: {
    cache: CacheState;
    fetchedAt: string;
    source: 'discord-aggregate';
    attempts?: number;
    details?: Record<string, unknown>;
  };
}

interface CacheEntry<T> {
  payload: T;
  fetchedAt: string;
  expiresAt: number;
}

interface DataResult<T> {
  payload: T;
  cacheState: CacheState;
  fetchedAt: string;
  debug?: Record<string, unknown>;
}

interface FetchEventsDebugInfo {
  attempts: number;
  status?: number;
  count?: number;
  rateLimitRemaining?: string | null;
}

interface HttpErrorPayload {
  message: string;
  details?: Record<string, unknown>;
}

class HttpError extends Error {
  readonly statusCode: number;
  readonly payload: HttpErrorPayload;

  constructor(statusCode: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.payload = { message, ...(details ? { details } : {}) };
  }
}

const eventsCache = new Map<string, CacheEntry<EventsPayload>>();
const imagesCache = new Map<string, CacheEntry<DiscordImagesPayload>>();

const ssmClient = new SSMClient({});
const ssmConfig = (() => {
  const raw = process.env.AMPLIFY_SSM_ENV_CONFIG;
  if (!raw) {
    return {} as Record<string, { path?: string; sharedPath?: string }>;
  }
  try {
    return JSON.parse(raw) as Record<string, { path?: string; sharedPath?: string }>;
  } catch (error) {
    console.warn('discord-aggregate failed to parse AMPLIFY_SSM_ENV_CONFIG', error);
    return {} as Record<string, { path?: string; sharedPath?: string }>;
  }
})();
const secretCache = new Map<string, string>();

function getHeader(headers: Record<string, string | undefined> | undefined, key: string): string | undefined {
  if (!headers) {
    return undefined;
  }
  const match = Object.entries(headers).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
  return match?.[1];
}

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.requestContext.http.method !== 'GET') {
    return createErrorResponse(new HttpError(405, 'Method Not Allowed'));
  }
  const expectedEdgeKey = (process.env.DISCORD_EDGE_ORIGIN_KEY ?? '').trim();
  if (expectedEdgeKey) {
    const presentedEdgeKey = (getHeader(event.headers, 'x-hstc-edge-key') ?? '').trim();
    if (!presentedEdgeKey || presentedEdgeKey !== expectedEdgeKey) {
      return createErrorResponse(new HttpError(403, 'Forbidden'));
    }
  }

  try {
    const params = event.queryStringParameters ?? {};
    const mode = parseMode(params.mode);
    const includeEvents = mode === 'both' || mode === 'events';
    const includeImages = mode === 'both' || mode === 'images';
    const includeDebugDetails = params.debug === '1' && process.env.ALLOW_PUBLIC_DEBUG_DETAILS === 'true';
    const wantAll = params.all === '1';

    const [token, guildId, channelId] = await Promise.all([
      resolveSecret('DISCORD_BOT_TOKEN'),
      includeEvents ? resolveSecret('DISCORD_GUILD_ID') : Promise.resolve(undefined),
      includeImages ? resolveSecret('DISCORD_CHANNEL_ID') : Promise.resolve(undefined)
    ]);

    const missingSecrets: string[] = [];
    if (!token) missingSecrets.push('DISCORD_BOT_TOKEN');
    if (includeEvents && !guildId) missingSecrets.push('DISCORD_GUILD_ID');
    if (includeImages && !channelId) missingSecrets.push('DISCORD_CHANNEL_ID');
    if (missingSecrets.length > 0) {
      throw new HttpError(500, 'Discord configuration missing', { missingEnv: missingSecrets });
    }

    const limit = includeImages ? parseLimit(params.limit) : DEFAULT_LIMIT;
    const before = includeImages ? parseBefore(params.before) : undefined;
    const authToken = token as string;

    const now = Date.now();
    const tasks: Array<Promise<DataResult<unknown>>> = [];

    const eventsTask =
      includeEvents && guildId
        ? getEventsData({
            guildId,
            token: authToken,
            wantAll,
            debug: includeDebugDetails,
            now
          })
        : null;

    const imagesTask =
      includeImages && channelId
        ? getImagesData({
            channelId,
            token: authToken,
            limit,
            before,
            debug: includeDebugDetails,
            now
          })
        : null;

    if (eventsTask) {
      tasks.push(eventsTask);
    }
    if (imagesTask) {
      tasks.push(imagesTask);
    }

    const results = await Promise.all(tasks);
    let eventsResult: DataResult<EventsPayload> | null = null;
    let imagesResult: DataResult<CombinedImagesBlock> | null = null;

    for (const result of results) {
      if (includeEvents && isEventsPayload(result.payload)) {
        eventsResult = result as DataResult<EventsPayload>;
      } else if (includeImages && isImagesPayload(result.payload)) {
        imagesResult = result as DataResult<CombinedImagesBlock>;
      }
    }

    const cacheStates = results.map((item) => item.cacheState);
    const response: CombinedResponse = {
      ...(eventsResult ? { events: eventsResult.payload } : {}),
      ...(imagesResult ? { images: imagesResult.payload } : {}),
      meta: {
        cache: combineCacheStates(cacheStates),
        fetchedAt: new Date().toISOString(),
        source: 'discord-aggregate',
        ...(includeDebugDetails
          ? {
              details: {
                mode,
                events: eventsResult?.debug,
                images: imagesResult?.debug
              },
              attempts: computeAttemptCount(
                extractAttemptCount(eventsResult?.debug?.attempts),
                extractAttemptCount(imagesResult?.debug?.attempts)
              )
            }
          : {})
      }
    };

    return {
      statusCode: 200,
      headers: successHeaders,
      body: JSON.stringify(response)
    };
  } catch (error) {
    return createErrorResponse(error);
  }
}

function createErrorResponse(error: unknown): LambdaResponse {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      headers: errorHeaders,
      body: JSON.stringify(error.payload)
    };
  }
  console.error('discord-aggregate unexpected failure', error);
  return {
    statusCode: 500,
    headers: errorHeaders,
    body: JSON.stringify({ message: 'Internal Server Error' })
  };
}

async function resolveSecret(key: string): Promise<string | undefined> {
  const direct = process.env[key];
  if (direct && !direct.includes('<value will be resolved during runtime>')) {
    return direct.trim();
  }
  if (secretCache.has(key)) {
    return secretCache.get(key);
  }
  const config = ssmConfig[key];
  if (!config) {
    return direct?.trim();
  }
  const candidates = [config.path, config.sharedPath].filter(Boolean) as string[];
  if (candidates.length === 0) {
    return direct?.trim();
  }
  try {
    const command = new GetParametersCommand({
      Names: candidates,
      WithDecryption: true
    });
    const { Parameters } = await ssmClient.send(command);
    const value = Parameters?.find((parameter) => parameter?.Value)?.Value?.trim();
    if (value) {
      secretCache.set(key, value);
      return value;
    }
  } catch (error) {
    console.error('discord-aggregate failed to resolve secret from SSM', { key, error });
  }
  return direct?.trim();
}

function parseMode(raw?: string): Mode {
  if (!raw) {
    return 'both';
  }
  if (raw === 'both' || raw === 'images' || raw === 'events') {
    return raw;
  }
  throw new HttpError(400, 'Unsupported mode parameter', { allowed: ['both', 'events', 'images'] });
}

function parseLimit(raw?: string): number {
  if (!raw || raw.length === 0) {
    return DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpError(400, 'limit must be a positive integer');
  }
  if (parsed > MAX_LIMIT) {
    throw new HttpError(400, `limit must be <= ${MAX_LIMIT}`);
  }
  return parsed;
}

function parseBefore(raw?: string): string | undefined {
  if (!raw || raw.length === 0) {
    return undefined;
  }
  if (!/^(\d{5,})$/.test(raw)) {
    throw new HttpError(400, 'before must be a valid Discord snowflake');
  }
  return raw;
}

function combineCacheStates(states: CacheState[]): CacheState {
  if (states.includes('STALE')) {
    return 'STALE';
  }
  if (states.includes('MISS')) {
    return 'MISS';
  }
  return 'HIT';
}

async function getEventsData({
  guildId,
  token,
  wantAll,
  debug,
  now
}: {
  guildId: string;
  token: string;
  wantAll: boolean;
  debug: boolean;
  now: number;
}): Promise<DataResult<EventsPayload>> {
  const cacheKey = guildId;
  const cached = eventsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      payload: decorateEventsPayload(cached.payload, wantAll),
      cacheState: 'HIT',
      fetchedAt: cached.fetchedAt,
      debug: debug ? { cacheKey, source: 'memory' } : undefined
    };
  }

  try {
    const { events, debugInfo } = await fetchScheduledEvents(guildId, token, debug);
    const payload = buildEventsPayload(guildId, events);
    const entry: CacheEntry<EventsPayload> = {
      payload,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + CACHE_TTL_MS
    };
    eventsCache.set(cacheKey, entry);
    return {
      payload: decorateEventsPayload(payload, wantAll),
      cacheState: 'MISS',
      fetchedAt: entry.fetchedAt,
      debug: debug ? { cacheKey, source: 'network', ...debugInfo } : undefined
    };
  } catch (error) {
    console.error('discord-aggregate events fetch failed', { guildId, error });
    if (cached) {
      return {
        payload: decorateEventsPayload(cached.payload, wantAll),
        cacheState: 'STALE',
        fetchedAt: cached.fetchedAt,
        debug: debug ? { cacheKey, source: 'stale-cache', error: error instanceof Error ? error.message : 'unknown' } : undefined
      };
    }
    throw error instanceof HttpError ? error : new HttpError(502, 'Failed to fetch Discord events');
  }
}

async function getImagesData({
  channelId,
  token,
  limit,
  before,
  debug,
  now
}: {
  channelId: string;
  token: string;
  limit: number;
  before?: string;
  debug: boolean;
  now: number;
}): Promise<DataResult<CombinedImagesBlock>> {
  const cacheKey = `${limit}:${before ?? 'latest'}`;
  const cached = imagesCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      payload: {
        ...cached.payload,
        meta: {
          fetchedAt: cached.fetchedAt,
          cache: 'HIT'
        }
      },
      cacheState: 'HIT',
      fetchedAt: cached.fetchedAt,
      debug: debug ? { cacheKey, source: 'memory' } : undefined
    };
  }

  try {
    const payload = await fetchDiscordImages({ channelId, token, limit, before });
    const entry: CacheEntry<DiscordImagesPayload> = {
      payload,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + CACHE_TTL_MS
    };
    imagesCache.set(cacheKey, entry);
    return {
      payload: {
        ...payload,
        meta: {
          fetchedAt: entry.fetchedAt,
          cache: 'MISS'
        }
      },
      cacheState: 'MISS',
      fetchedAt: entry.fetchedAt,
      debug: debug ? { cacheKey, source: 'network' } : undefined
    };
  } catch (error) {
    console.error('discord-aggregate images fetch failed', { channelId, limit, before, error });
    if (cached) {
      return {
        payload: {
          ...cached.payload,
          meta: {
            fetchedAt: cached.fetchedAt,
            cache: 'STALE'
          }
        },
        cacheState: 'STALE',
        fetchedAt: cached.fetchedAt,
        debug: debug ? { cacheKey, source: 'stale-cache' } : undefined
      };
    }
    throw error instanceof HttpError ? error : new HttpError(502, 'Failed to fetch Discord images');
  }
}

function isEventsPayload(payload: unknown): payload is EventsPayload {
  return Boolean(payload && typeof payload === 'object' && 'guildId' in payload && 'upcoming' in payload && 'active' in payload);
}

function isImagesPayload(payload: unknown): payload is CombinedImagesBlock {
  return Boolean(payload && typeof payload === 'object' && 'data' in payload && 'page' in payload);
}

function computeAttemptCount(eventsAttempts?: number, imagesAttempts?: number): number | undefined {
  const max = Math.max(eventsAttempts ?? 0, imagesAttempts ?? 0);
  return max > 0 ? max : undefined;
}

function extractAttemptCount(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function decorateEventsPayload(payload: EventsPayload, wantAll: boolean): EventsPayload {
  if (wantAll) {
    if (payload.all) {
      return payload;
    }
    return { ...payload, all: buildAllBucket(payload) };
  }
  if (payload.all) {
    const { all: _drop, ...rest } = payload;
    return rest as EventsPayload;
  }
  return payload;
}

function buildEventsPayload(guildId: string, events: DiscordScheduledEvent[]): EventsPayload {
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const normalized = events.map((event) => normalizeEvent(event, nowMs));
  const upcoming = normalized.filter((event) => event.isUpcoming && !event.isActive);
  const active = normalized.filter((event) => event.isActive);
  const past = normalized.filter((event) => event.isPast);

  return {
    generatedAt: nowIso,
    guildId,
    upcoming: sortAscending(upcoming),
    active: sortAscending(active),
    past: sortDescending(past),
    rawCount: events.length
  };
}

function buildAllBucket(payload: EventsPayload): Array<NormalizedEvent & { bucket: 'upcoming' | 'active' | 'past' }> {
  const combined: Array<NormalizedEvent & { bucket: 'upcoming' | 'active' | 'past' }> = [
    ...payload.upcoming.map((event) => ({ ...event, bucket: 'upcoming' as const })),
    ...payload.active.map((event) => ({ ...event, bucket: 'active' as const })),
    ...payload.past.map((event) => ({ ...event, bucket: 'past' as const }))
  ];
  return combined.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function sortAscending(list: NormalizedEvent[]): NormalizedEvent[] {
  return [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function sortDescending(list: NormalizedEvent[]): NormalizedEvent[] {
  return [...list].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

function normalizeEvent(event: DiscordScheduledEvent, nowMs: number): NormalizedEvent {
  const startMs = Date.parse(event.scheduled_start_time);
  const endMs = event.scheduled_end_time ? Date.parse(event.scheduled_end_time) : undefined;
  const status = toStatus(event.status);
  const type = toType(event.entity_type);
  const imageUrl = event.image ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=512` : undefined;
  const isActive = status === 'ACTIVE';
  const hasEnded = typeof endMs === 'number' && endMs < nowMs;
  const isStaleScheduled = !isActive && status === 'SCHEDULED' && startMs < nowMs;
  const isPast = status === 'COMPLETED' || status === 'CANCELED' || hasEnded || isStaleScheduled;
  const isUpcoming = !isActive && !isPast && startMs > nowMs && status === 'SCHEDULED';

  return {
    id: event.id,
    name: event.name,
    description: event.description ?? undefined,
    startsAt: event.scheduled_start_time,
    endsAt: event.scheduled_end_time ?? undefined,
    status,
    type,
    location: event.entity_metadata?.location ?? undefined,
    imageUrl,
    userCount: event.user_count,
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

async function fetchDiscordImages({
  channelId,
  token,
  limit,
  before
}: {
  channelId: string;
  token: string;
  limit: number;
  before?: string;
}): Promise<DiscordImagesPayload> {
  const url = new URL(`${DISCORD_API_BASE}/channels/${channelId}/messages`);
  url.searchParams.set('limit', String(limit));
  if (before) {
    url.searchParams.set('before', before);
  }
  const response = await fetchWithRateLimit(url, token);
  const messages = (await response.json()) as DiscordMessage[];
  const normalized = normalizeMessages(messages);
  const lastMessage = messages.at(-1);

  return {
    data: normalized,
    page: {
      nextBefore: lastMessage?.id,
      hasMore: messages.length === limit
    }
  };
}

async function fetchWithRateLimit(url: URL, token: string): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bot ${token}`,
        'User-Agent': 'hstc-discord-aggregate (https://hstc.space, 1.0)'
      }
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retrySeconds = retryAfter ? Number.parseFloat(retryAfter) : 1;
      const delay = Number.isFinite(retrySeconds) ? retrySeconds * 1000 : 1000;
      await sleep(delay);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      lastError = new Error(`Discord images API responded with ${response.status}`);
    } else {
      return response;
    }

    attempt += 1;
    await sleep(200 * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error('Discord images request failed');
}

function normalizeMessages(messages: DiscordMessage[]): DiscordImageItem[] {
  const results: DiscordImageItem[] = [];

  for (const message of messages) {
    const seenUrls = new Set<string>();
    const pushImage = (sourceId: string, image: { url?: string; proxy_url?: string; width?: number | null; height?: number | null }) => {
      if (!image) {
        return;
      }
      const url = image.url ?? image.proxy_url;
      if (!url || seenUrls.has(url)) {
        return;
      }
      seenUrls.add(url);
      results.push({
        id: message.id,
        attachmentId: sourceId,
        imageUrl: url,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
        uploadedAt: message.timestamp,
        author: {
          id: message.author.id,
          name: resolveAuthorName(message.author),
          avatarUrl: buildAvatarUrl(message.author)
        }
      });
    };

    for (const attachment of message.attachments ?? []) {
      if (isImageAttachment(attachment)) {
        pushImage(attachment.id, {
          url: attachment.url ?? undefined,
          proxy_url: attachment.proxy_url,
          width: attachment.width,
          height: attachment.height
        });
      }
    }

    for (const embed of message.embeds ?? []) {
      if (embed.type && embed.type !== 'image' && embed.type !== 'rich') {
        continue;
      }
      const source = embed.image ?? embed.thumbnail ?? (embed.url ? { url: embed.url } : undefined);
      if (!source) {
        continue;
      }
      const sourceId = source.url ?? source.proxy_url;
      if (!sourceId) {
        continue;
      }
      pushImage(sourceId, source);
    }
  }

  return results;
}

function isImageAttachment(attachment: DiscordAttachment): boolean {
  if (!attachment) {
    return false;
  }
  if (attachment.content_type?.startsWith('image/')) {
    return true;
  }
  const extension = attachment.filename.split('.').pop()?.toLowerCase();
  return extension ? ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension) : false;
}

function resolveAuthorName(author: DiscordAuthor): string {
  return author.global_name ?? author.username ?? 'Unbekannter Pilot';
}

function buildAvatarUrl(author: DiscordAuthor): string | undefined {
  if (!author.avatar) {
    return undefined;
  }
  const isAnimated = author.avatar.startsWith('a_');
  const extension = isAnimated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.${extension}`;
}

async function fetchScheduledEvents(guildId: string, token: string, debug: boolean): Promise<{ events: DiscordScheduledEvent[]; debugInfo?: FetchEventsDebugInfo }> {
  const url = new URL(`${DISCORD_API_BASE}/guilds/${guildId}/scheduled-events?with_user_count=true`);
  let attempt = 0;
  let lastError: unknown;
  let failingStatus: number | undefined;
  let failingBodySnippet: string | undefined;

  while (attempt <= MAX_RETRIES) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bot ${token}`,
        'User-Agent': 'hstc-discord-aggregate (https://hstc.space, 1.0)'
      }
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retrySeconds = retryAfter ? Number.parseFloat(retryAfter) : 1;
      const delay = Number.isFinite(retrySeconds) ? retrySeconds * 1000 : 1000;
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
      const events = (await response.json()) as DiscordScheduledEvent[];
      return {
        events,
        debugInfo: debug
          ? {
              attempts: attempt + 1,
              status: response.status,
              count: events.length,
              rateLimitRemaining: response.headers.get('x-ratelimit-remaining')
            }
          : undefined
      };
    }

    attempt += 1;
    await sleep(200 * attempt);
  }

  if (debug && lastError instanceof Error) {
    throw new HttpError(502, lastError.message, { failingStatus, failingBodySnippet, attempts: attempt });
  }
  throw lastError instanceof Error ? lastError : new Error('Discord events fetch failed');
}
