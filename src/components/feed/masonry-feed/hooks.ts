import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { feedApi } from '@/api';
import { toast } from 'sonner';
import type { FeedItem } from '@/types/api';
import { type FeedTab, getAspectRatio } from './types';

export function useFeedState() {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  return {
    activeTab,
    setActiveTab,
    items,
    setItems,
    isLoading,
    setIsLoading,
    cursor,
    setCursor,
    hasMore,
    setHasMore,
    loaderRef,
  };
}

export function useFeedFetch(
  activeTab: FeedTab,
  cursor: string | null,
  hasMore: boolean,
  isLoading: boolean,
  setItems: React.Dispatch<React.SetStateAction<FeedItem[]>>,
  setIsLoading: (loading: boolean) => void,
  setCursor: (cursor: string | null) => void,
  setHasMore: (hasMore: boolean) => void
) {
  const fetchFeed = useCallback(async (isInitial = false) => {
    if (isLoading || (!hasMore && !isInitial)) return;

    setIsLoading(true);
    try {
      const response = activeTab === 'discover'
        ? await feedApi.getPublicFeed({
            limit: 20,
            cursor: isInitial ? undefined : cursor || undefined,
          })
        : await feedApi.getMyHistory({
            limit: 20,
            cursor: isInitial ? undefined : cursor || undefined,
          });

      if (isInitial) {
        setItems(response.items || []);
      } else {
        setItems((prev) => [...prev, ...(response.items || [])]);
      }

      setCursor(response.next_cursor);
      setHasMore(!!response.next_cursor);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      if (isInitial) {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, cursor, hasMore, isLoading, setItems, setIsLoading, setCursor, setHasMore]);

  // Reset and fetch when tab changes
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    fetchFeed(true);
  }, [activeTab]);

  return fetchFeed;
}

export function useInfiniteScroll(
  loaderRef: React.RefObject<HTMLDivElement | null>,
  fetchFeed: (isInitial?: boolean) => void,
  hasMore: boolean,
  isLoading: boolean
) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchFeed();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchFeed, hasMore, isLoading, loaderRef]);
}

export function useVisibilityToggle(
  setItems: React.Dispatch<React.SetStateAction<FeedItem[]>>
) {
  const handleVisibilityToggle = async (itemId: number, isPublic: boolean) => {
    try {
      await feedApi.toggleVisibility(itemId, { is_public: isPublic });

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_public: isPublic } : item
        )
      );

      toast.success(isPublic ? '공개로 변경되었습니다' : '비공개로 변경되었습니다');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('변경에 실패했습니다');
    }
  };

  return handleVisibilityToggle;
}

// True Masonry Layout Hook - distributes items to shortest column
export function useMasonryColumns(items: FeedItem[], columnCount: number = 2): FeedItem[][] {
  return useMemo(() => {
    const columns: FeedItem[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights: number[] = Array(columnCount).fill(0);

    items.forEach((item) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

      // Add item to shortest column
      columns[shortestColumnIndex].push(item);

      // Estimate height based on aspect ratio (for balancing)
      const aspectRatio = getAspectRatio(item.id);
      const estimatedHeight = (1 / aspectRatio) * 100 + 80; // image height + content padding
      columnHeights[shortestColumnIndex] += estimatedHeight;
    });

    return columns;
  }, [items, columnCount]);
}
