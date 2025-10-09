import { setTimeout as sleep } from 'node:timers/promises';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const CACHE_TTL_MS = 300_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
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

interface CacheEntry {
  readonly payload: DiscordImagesPayload;
  readonly fetchedAt: string;
  readonly expiresAt: number;
}

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.requestContext.http.method !== 'GET') {
    return errorResponse(405, 'Method Not Allowed');
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId) {
    console.error('Missing Discord configuration.');
    return errorResponse(500, 'Discord configuration is not set.');
  }

  const limit = parseLimit(event.queryStringParameters?.limit);
  const before = sanitizeSnowflake(event.queryStringParameters?.before);

  const cacheKey = `${limit}:${before ?? 'latest'}`;
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return successResponse(cached.payload, cached.fetchedAt, 'HIT');
  }

  let payload: DiscordImagesPayload | null = null;
  let fetchedAt = new Date().toISOString();
  let cacheState: CacheState = cached ? 'STALE' : 'MISS';

  try {
    payload = await fetchDiscordImages({ channelId, token, limit, before });
    fetchedAt = new Date().toISOString();
    cacheState = 'MISS';

    memoryCache.set(cacheKey, {
      payload,
      fetchedAt,
      expiresAt: now + CACHE_TTL_MS
    });
  } catch (err) {
    console.error('Discord fetch failed', err);

    if (cached) {
      payload = cached.payload;
      fetchedAt = cached.fetchedAt;
      cacheState = 'STALE';
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
