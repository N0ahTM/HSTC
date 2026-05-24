import { useDiscordData, type DiscordChannelImage } from '@/providers/DiscordDataProvider';

export type { DiscordChannelImage, DiscordChannelImageAuthor } from '@/providers/DiscordDataProvider';

interface UseDiscordChannelImagesResult {
  images: DiscordChannelImage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;
  fetchNext: () => Promise<void>;
  retry: () => Promise<void>;
}

const DEFAULT_LIMIT = 20;

export function useDiscordChannelImages(limit: number = DEFAULT_LIMIT): UseDiscordChannelImagesResult {
  const { images, refresh } = useDiscordData();
  if (import.meta.env.DEV && limit !== DEFAULT_LIMIT) {
    // Provider currently serves a fixed page size to keep response/cache behavior consistent.
    console.warn(`[discord-images] Custom limit (${limit}) is ignored; using ${DEFAULT_LIMIT}.`);
  }

  return {
    images: images.items,
    loading: images.loading,
    error: images.error,
    hasMore: images.hasMore,
    isFetchingMore: images.isFetchingMore,
    fetchNext: images.fetchNext,
    retry: refresh
  };
}

