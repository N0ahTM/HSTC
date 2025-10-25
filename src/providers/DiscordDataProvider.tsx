import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getDiscordCombinedEndpoint } from '@/config/amplifyOutputs';

type CacheState = 'HIT' | 'MISS' | 'STALE';

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

interface DiscordChannelImagesBlock {
  data: DiscordChannelImage[];
  page: {
    nextBefore?: string;
    hasMore: boolean;
  };
  meta?: {
    fetchedAt: string;
    cache: CacheState;
  };
}

interface CombinedApiResponse {
  events?: {
    generatedAt: string;
    guildId: string;
    upcoming: DiscordCommunityEvent[];
    active: DiscordCommunityEvent[];
    past: DiscordCommunityEvent[];
    rawCount: number;
    all?: Array<DiscordCommunityEvent & { bucket: 'upcoming' | 'active' | 'past' }>;
  };
  images?: DiscordChannelImagesBlock;
  meta?: {
    cache: CacheState;
    fetchedAt: string;
  };
}

interface DiscordDataContextValue {
  events: {
    upcoming: DiscordCommunityEvent[];
    active: DiscordCommunityEvent[];
    past: DiscordCommunityEvent[];
    loading: boolean;
    error?: string;
    metaCache?: CacheState;
    generatedAt?: string;
    guildId?: string;
    totalCount?: number;
  };
  images: {
    items: DiscordChannelImage[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    isFetchingMore: boolean;
    fetchNext: () => Promise<void>;
  };
  meta?: {
    cache?: CacheState;
    fetchedAt?: string;
  };
  refresh: () => Promise<void>;
}

const DEFAULT_IMAGE_LIMIT = 20;
const isDev = import.meta.env.DEV;

const DiscordDataContext = createContext<DiscordDataContextValue | null>(null);

export function DiscordDataProvider({ children }: { children: ReactNode }) {
  const [eventsPayload, setEventsPayload] = useState<CombinedApiResponse['events'] | null>(null);
  const [eventsError, setEventsError] = useState<string | undefined>();
  const [images, setImages] = useState<DiscordChannelImage[]>([]);
  const [imagesPage, setImagesPage] = useState<{ nextBefore?: string; hasMore: boolean }>({ hasMore: false });
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [metaCache, setMetaCache] = useState<CacheState | undefined>();
  const [metaFetchedAt, setMetaFetchedAt] = useState<string | undefined>();

  const seenKeysRef = useRef<Set<string>>(new Set());
  const initialController = useRef<AbortController | null>(null);
  const loadMoreController = useRef<AbortController | null>(null);

  const buildCombinedUrl = useCallback(async (query: Record<string, string | number | undefined>) => {
    const endpoint = await getDiscordCombinedEndpoint();
    const base =
      endpoint.startsWith('http') || typeof window === 'undefined'
        ? endpoint
        : `${window.location.origin.replace(/\/$/, '')}${endpoint}`;
    if (base.startsWith('http')) {
      preconnectToOrigin(base);
    }
    const url = new URL(base);
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        url.searchParams.set(key, value);
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }, []);

  const loadInitial = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    initialController.current?.abort();
    const controller = new AbortController();
    initialController.current = controller;

    setIsLoading(true);
    setEventsError(undefined);
    setImagesError(null);
    setMetaCache(undefined);
    setMetaFetchedAt(undefined);

    try {
      const url = await buildCombinedUrl({ mode: 'both', limit: DEFAULT_IMAGE_LIMIT });
      const response = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Combined request failed: ${response.status}`);
      }
      const json = (await response.json()) as CombinedApiResponse;
      seenKeysRef.current = new Set();
      setEventsPayload(json.events ?? null);
      const imagesBlock = json.images;
      if (imagesBlock) {
        for (const image of imagesBlock.data) {
          seenKeysRef.current.add(makeImageKey(image));
        }
        setImages(imagesBlock.data);
        setImagesPage(imagesBlock.page ?? { hasMore: false });
        setImagesError(null);
      } else {
        setImages([]);
        setImagesPage({ hasMore: false });
      }
      setMetaCache(json.meta?.cache);
      setMetaFetchedAt(json.meta?.fetchedAt);
      if (isDev) {
        console.info('[discord-data] initial load', {
          events: {
            active: json.events?.active.length ?? 0,
            upcoming: json.events?.upcoming.length ?? 0,
            past: json.events?.past.length ?? 0
          },
          images: json.images?.data.length ?? 0,
          cache: json.meta?.cache
        });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error('discord-data initial load failed', error);
      setEventsError('Events konnten nicht geladen werden.');
      setImagesError('Discord-Bilder konnten nicht geladen werden.');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [buildCombinedUrl]);

  const loadMoreImages = useCallback(async () => {
    if (isFetchingMore || !imagesPage.hasMore || !imagesPage.nextBefore) {
      return;
    }
    loadMoreController.current?.abort();
    const controller = new AbortController();
    loadMoreController.current = controller;
    setIsFetchingMore(true);
    try {
      const url = await buildCombinedUrl({
        mode: 'images',
        limit: DEFAULT_IMAGE_LIMIT,
        before: imagesPage.nextBefore
      });
      const response = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Images pagination failed: ${response.status}`);
      }
      const json = (await response.json()) as CombinedApiResponse;
      const imagesBlock = json.images;
      if (!imagesBlock) {
        setImagesPage({ hasMore: false });
        return;
      }
      const freshItems = imagesBlock.data.filter((item) => {
        const key = makeImageKey(item);
        if (seenKeysRef.current.has(key)) {
          return false;
        }
        seenKeysRef.current.add(key);
        return true;
      });
      setImages((prev) => [...prev, ...freshItems]);
      setImagesPage(imagesBlock.page ?? { hasMore: false });
      setImagesError(null);
      if (isDev) {
        console.info('[discord-data] loaded more images', {
          added: freshItems.length,
          total: freshItems.length + images.length,
          hasMore: imagesBlock.page?.hasMore
        });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error('discord-data pagination failed', error);
      setImagesError('Weitere Discord-Bilder konnten nicht geladen werden.');
    } finally {
      setIsFetchingMore(false);
    }
  }, [buildCombinedUrl, images.length, imagesPage.hasMore, imagesPage.nextBefore, isFetchingMore]);

  useEffect(() => {
    void loadInitial();
    return () => {
      initialController.current?.abort();
      loadMoreController.current?.abort();
    };
  }, [loadInitial]);

  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  const contextValue = useMemo<DiscordDataContextValue>(
    () => ({
      events: {
        upcoming: eventsPayload?.upcoming ?? [],
        active: eventsPayload?.active ?? [],
        past: eventsPayload?.past ?? [],
        loading: isLoading,
        error: eventsError,
        metaCache,
        generatedAt: eventsPayload?.generatedAt,
        guildId: eventsPayload?.guildId,
        totalCount: eventsPayload?.rawCount
      },
      images: {
        items: images,
        loading: isLoading,
        error: imagesError,
        hasMore: imagesPage.hasMore,
        isFetchingMore,
        fetchNext: loadMoreImages
      },
      meta: {
        cache: metaCache,
        fetchedAt: metaFetchedAt
      },
      refresh
    }),
    [
      eventsPayload,
      eventsError,
      images,
      imagesError,
      imagesPage.hasMore,
      isFetchingMore,
      isLoading,
      loadMoreImages,
      metaCache,
      metaFetchedAt,
      refresh
    ]
  );

  return <DiscordDataContext.Provider value={contextValue}>{children}</DiscordDataContext.Provider>;
}

export function useDiscordData(): DiscordDataContextValue {
  const context = useContext(DiscordDataContext);
  if (!context) {
    throw new Error('useDiscordData must be used within a DiscordDataProvider');
  }
  return context;
}

function makeImageKey(image: DiscordChannelImage): string {
  return `${image.id}:${image.attachmentId}`;
}

const preconnectedOrigins = new Set<string>();

function preconnectToOrigin(endpoint: string) {
  if (typeof document === 'undefined' || !endpoint.startsWith('http')) {
    return;
  }
  try {
    const url = new URL(endpoint);
    const origin = `${url.protocol}//${url.host}`;
    if (preconnectedOrigins.has(origin)) {
      return;
    }
    preconnectedOrigins.add(origin);
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = '';
    document.head.appendChild(link);
  } catch {
    // ignore invalid endpoint values
  }
}
