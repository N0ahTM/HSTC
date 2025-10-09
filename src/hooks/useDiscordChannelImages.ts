import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface DiscordChannelImageAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface DiscordChannelImage {
  id: string;
  attachmentId: string;
  imageUrl: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  author: DiscordChannelImageAuthor;
}

interface DiscordImagesResponse {
  data: DiscordChannelImage[];
  page: {
    nextBefore?: string;
    hasMore: boolean;
  };
}

interface DiscordImagesEnvelope extends DiscordImagesResponse {
  meta: {
    fetchedAt: string;
    cache: 'MISS' | 'HIT' | 'STALE';
  };
}

interface FetchOptions {
  before?: string | null;
  signal?: AbortSignal;
}

interface UseDiscordChannelImagesResult {
  images: DiscordChannelImage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;
  fetchNext: () => Promise<void>;
  retry: () => Promise<void>;
}

const DEFAULT_LIMIT = 10;
const PREFETCH_THRESHOLD = 4;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 220;

const API_ENDPOINT = import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT ?? '/api/discord-images';

function createRequestUrl(limit: number, before?: string | null): URL {
  const base = API_ENDPOINT.startsWith('http')
    ? API_ENDPOINT
    : `${window.location.origin.replace(/\/$/, '')}${API_ENDPOINT}`;

  const url = new URL(base);
  url.searchParams.set('limit', String(limit));
  if (before) {
    url.searchParams.set('before', before);
  }
  return url;
}

function makeItemKey(item: DiscordChannelImage): string {
  return `${item.id}:${item.attachmentId}`;
}

async function fetchWithRetry(url: URL, signal?: AbortSignal): Promise<DiscordImagesEnvelope> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const abortListener = () => controller.abort();

      if (signal) {
        if (signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        signal.addEventListener('abort', abortListener, { once: true });
      }

      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return (await response.json()) as DiscordImagesEnvelope;
      } finally {
        if (signal) {
          signal.removeEventListener('abort', abortListener);
        }
      }
    } catch (error) {
      if (signal && signal.aborted) {
        throw error;
      }

      lastError = error;
      if (attempt === MAX_RETRIES) {
        break;
      }

      const delay = RETRY_BASE_DELAY_MS * 2 ** attempt;
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown fetch error');
}

export function useDiscordChannelImages(limit: number = DEFAULT_LIMIT): UseDiscordChannelImagesResult {
  const [images, setImages] = useState<DiscordChannelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const seenKeysRef = useRef<Set<string>>(new Set());
  const bufferRef = useRef<DiscordChannelImage[]>([]);
  const bufferKeysRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(true);
  const hasMoreRef = useRef(true);

  const resetState = useCallback(() => {
    seenKeysRef.current.clear();
    bufferRef.current = [];
    bufferKeysRef.current.clear();
    cursorRef.current = null;
    hasMoreRef.current = true;
    setHasMore(true);
  }, []);

  const fetchImages = useCallback(
    async ({ before, signal }: FetchOptions): Promise<DiscordImagesResponse> => {
      const url = createRequestUrl(limit, before);
      const response = await fetchWithRetry(url, signal);
      return response;
    },
    [limit]
  );

  const prefetch = useCallback(async () => {
    if (!hasMoreRef.current) {
      return;
    }
    if (prefetchPromiseRef.current) {
      return prefetchPromiseRef.current;
    }

    const promise = (async () => {
      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const result = await fetchImages({ before: cursorRef.current, signal: controller.signal });
        if (!isMountedRef.current) {
          return;
        }

        cursorRef.current = result.page.nextBefore ?? null;
        hasMoreRef.current = result.page.hasMore;
        setHasMore(result.page.hasMore);

        const nextItems = result.data.filter((item) => {
          const key = makeItemKey(item);
          if (seenKeysRef.current.has(key) || bufferKeysRef.current.has(key)) {
            return false;
          }
          bufferKeysRef.current.add(key);
          return true;
        });

        if (nextItems.length > 0) {
          bufferRef.current = [...bufferRef.current, ...nextItems];
        }
      } catch (err) {
        console.error('Prefetch failed', err);
      } finally {
        prefetchPromiseRef.current = null;
      }
    })();

    prefetchPromiseRef.current = promise;
    await promise;
  }, [fetchImages]);

  const ensurePrefetchBuffer = useCallback(() => {
    if (!hasMoreRef.current) {
      return;
    }
    if (bufferRef.current.length >= PREFETCH_THRESHOLD) {
      return;
    }
    void prefetch();
  }, [prefetch]);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.length === 0) {
      return;
    }

    setImages((current) => {
      const merged = [...current, ...bufferRef.current];
      for (const item of bufferRef.current) {
        seenKeysRef.current.add(makeItemKey(item));
      }
      bufferRef.current = [];
      bufferKeysRef.current.clear();
      return merged;
    });
  }, []);

  const loadInitial = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    resetState();

    try {
      const result = await fetchImages({ before: null, signal: controller.signal });
      if (!isMountedRef.current) {
        return;
      }

      cursorRef.current = result.page.nextBefore ?? null;
      hasMoreRef.current = result.page.hasMore;
      setHasMore(result.page.hasMore);

      const nextItems = result.data.filter((item) => {
        const key = makeItemKey(item);
        if (seenKeysRef.current.has(key)) {
          return false;
        }
        seenKeysRef.current.add(key);
        return true;
      });

      setImages(nextItems);
      ensurePrefetchBuffer();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.error('Initial Discord images load failed', err);
      if (!isMountedRef.current) {
        return;
      }
      setError('Discord-Bilder konnten nicht geladen werden.');
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [ensurePrefetchBuffer, fetchImages, resetState]);

  const fetchNext = useCallback(async () => {
    if (loading || isFetchingMore) {
      return;
    }

    if (bufferRef.current.length === 0) {
      if (!hasMoreRef.current) {
        return;
      }
      setIsFetchingMore(true);
      try {
        await prefetch();
      } finally {
        setIsFetchingMore(false);
      }
    }

    flushBuffer();
    ensurePrefetchBuffer();
  }, [ensurePrefetchBuffer, flushBuffer, isFetchingMore, loading, prefetch]);

  const retry = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadInitial();

    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [loadInitial]);

  return useMemo(
    () => ({ images, loading, error, hasMore, isFetchingMore, fetchNext, retry }),
    [error, fetchNext, hasMore, images, isFetchingMore, loading, retry]
  );
}
