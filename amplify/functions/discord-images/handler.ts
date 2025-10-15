import { setTimeout as sleep } from 'node:timers/promises';
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const CACHE_TTL_MS = 300_000;
// Removed persistent S3 cache to reduce costs / complexity.

// Important: Do NOT set Access-Control-Allow-Origin here because Lambda Function URL
// can inject it based on its own CORS configuration. Having two values results in
// the browser error: "The 'Access-Control-Allow-Origin' header contains multiple values".
const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type, Origin, Referer, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Type, Content-Length',
  Vary: 'Origin'
};

type CacheState = 'MISS' | 'HIT' | 'STALE';

type LambdaEvent = {
  readonly requestContext: { readonly http: { readonly method: string } };
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

const memoryCache = new Map<string, CacheEntry>();
const ssmClient = new SSMClient({});
const ssmConfig = (() => {
  const raw = process.env.AMPLIFY_SSM_ENV_CONFIG;
  if (!raw) return {} as Record<string, { path?: string; sharedPath?: string }>;
  try {
    return JSON.parse(raw) as Record<string, { path?: string; sharedPath?: string }>;
  } catch (error) {
    console.warn('discord-images failed to parse AMPLIFY_SSM_ENV_CONFIG', error);
    return {} as Record<string, { path?: string; sharedPath?: string }>;
  }
})();
const secretCache = new Map<string, string>();

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
    console.error('discord-images failed to resolve secret from SSM', { key, error });
  }

  return direct?.trim();
}

interface CacheEntry {
  readonly payload: DiscordImagesPayload;
  readonly fetchedAt: string;
  readonly expiresAt: number;
}

// No persistent S3 client – only in-memory cache per warm Lambda container.

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      // Explicit empty body to satisfy some proxies
      body: ''
    };
  }

  if (event.requestContext.http.method !== 'GET') {
    return errorResponse(405, 'Method Not Allowed');
  }

  const token = await resolveSecret('DISCORD_BOT_TOKEN');
  const channelId = await resolveSecret('DISCORD_CHANNEL_ID');

  if (!token || !channelId) {
    const missing: string[] = [];
    if (!token) missing.push('DISCORD_BOT_TOKEN');
    if (!channelId) missing.push('DISCORD_CHANNEL_ID');
    console.error('Missing Discord configuration variables', { missing });
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Discord configuration is not set.',
        missingEnv: missing,
        hint: 'Set them in your .env for local sandbox or as Amplify secrets/environment variables before deploying.'
      })
    };
  }

  const limit = parseLimit(event.queryStringParameters?.limit);
  const before = sanitizeSnowflake(event.queryStringParameters?.before);

  const cacheKey = `${limit}:${before ?? 'latest'}`;
  let cached = memoryCache.get(cacheKey);

  // Persistent cache removed: only check in-memory.

  const now = Date.now();

  console.info('discord-images invoked', {
    limit,
    before,
    cacheKey,
    cacheStatus: cached ? (cached.expiresAt > now ? 'fresh' : 'stale') : 'miss'
  });

  if (cached && cached.expiresAt > now) {
    console.info('Serving Discord images from cache', {
      cacheKey,
      fetchedAt: cached.fetchedAt,
      itemCount: cached.payload.data.length
    });
    return successResponse(cached.payload, cached.fetchedAt, 'HIT');
  }

  let payload: DiscordImagesPayload | null = null;
  let fetchedAt = new Date().toISOString();
  let cacheState: CacheState = cached ? 'STALE' : 'MISS';

  try {
    payload = await fetchDiscordImages({ channelId, token, limit, before });
    fetchedAt = new Date().toISOString();
    cacheState = 'MISS';

    const entry: CacheEntry = {
      payload,
      fetchedAt,
      expiresAt: Date.now() + CACHE_TTL_MS
    };

    memoryCache.set(cacheKey, entry);

    console.info('Fetched Discord images from API', {
      cacheKey,
      itemCount: payload.data.length,
      nextBefore: payload.page.nextBefore,
      rateLimited: false
    });
  } catch (err) {
    console.error('Discord fetch failed', err);

    if (cached) {
      payload = cached.payload;
      fetchedAt = cached.fetchedAt;
      cacheState = 'STALE';
      console.warn('Returning stale Discord images cache entry', {
        cacheKey,
        fetchedAt,
        itemCount: payload.data.length
      });
    } else {
      return errorResponse(502, 'Failed to load Discord images.');
    }
  }

  return successResponse(payload, fetchedAt, cacheState);
}

function successResponse(payload: DiscordImagesPayload, fetchedAt: string, cache: CacheState): LambdaResponse {
  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      meta: {
        fetchedAt,
        cache
      }
    })
  };
}

function errorResponse(statusCode: number, message: string): LambdaResponse {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: message
    })
  };
}

function parseLimit(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function sanitizeSnowflake(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  return /^(\d{5,})$/.test(raw) ? raw : undefined;
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

  while (attempt < 2) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bot ${token}`
      }
    });

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? Number.parseFloat(retryAfterHeader) : 1;
      const delay = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 1000;
      console.warn(`Discord rate limited. Retrying after ${delay}ms.`);
      await sleep(delay);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      lastError = new Error(`Discord API responded with status ${response.status}`);
    } else {
      return response;
    }

    attempt += 1;
    await sleep(200 * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error('Discord API request failed.');
}

function normalizeMessages(messages: DiscordMessage[]): DiscordImageItem[] {
  const results: DiscordImageItem[] = [];

  for (const message of messages) {
    if (!Array.isArray(message.attachments) || message.attachments.length === 0) {
      // keep processing embeds even if no attachments
    }

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
      if (!isImageAttachment(attachment)) {
        continue;
      }

      pushImage(attachment.id, {
        url: attachment.url ?? undefined,
        proxy_url: attachment.proxy_url,
        width: attachment.width,
        height: attachment.height
      });
    }

    if (Array.isArray(message.embeds) && message.embeds.length > 0) {
      for (const embed of message.embeds) {
        if (embed.type && embed.type !== 'image' && embed.type !== 'rich') {
          continue;
        }

        const imageSource = embed.image ?? embed.thumbnail ?? (embed.url ? { url: embed.url } : undefined);
        if (!imageSource) {
          continue;
        }

        const sourceId = imageSource.url ?? imageSource.proxy_url;
        if (!sourceId) {
          continue;
        }

        pushImage(sourceId, imageSource);
      }
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
  if (!extension) {
    return false;
  }

  return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension);
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

// Removed S3 persistence helper functions.
