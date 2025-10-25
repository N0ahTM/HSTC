import { useDiscordData, type DiscordChannelImage, type DiscordChannelImageAuthor } from '@/providers/DiscordDataProvider';

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

export function useDiscordChannelImages(_limit: number = DEFAULT_LIMIT): UseDiscordChannelImagesResult {
  const { images, refresh } = useDiscordData();

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

