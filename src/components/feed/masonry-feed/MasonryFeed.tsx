import { AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

import { TabHeader } from './TabHeader';
import { FeedCard } from './FeedCard';
import { LoadingIndicator, EndMessage } from './LoadingIndicator';
import { EmptyState } from './EmptyState';
import {
  useFeedState,
  useFeedFetch,
  useInfiniteScroll,
  useVisibilityToggle,
  useMasonryColumns,
} from './hooks';
import type { MasonryFeedProps } from './types';

export function MasonryFeed({ className, onItemClick }: MasonryFeedProps) {
  const {
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
  } = useFeedState();

  const fetchFeed = useFeedFetch(
    activeTab,
    cursor,
    hasMore,
    isLoading,
    setItems,
    setIsLoading,
    setCursor,
    setHasMore
  );

  useInfiniteScroll(loaderRef, fetchFeed, hasMore, isLoading);

  const handleVisibilityToggle = useVisibilityToggle(setItems);

  // True masonry column distribution
  const columnItems = useMasonryColumns(items, 2);

  // Track global index for animation delays
  let globalIndex = 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Header */}
      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Pinterest-style Masonry Grid */}
      <div className="flex gap-3 px-3 pt-2">
        <AnimatePresence mode="popLayout">
          {columnItems.map((column, colIdx) => (
            <div
              key={`${activeTab}-col-${colIdx}`}
              className="flex-1 flex flex-col gap-3"
            >
              {column.map((item) => {
                const currentIndex = globalIndex++;
                return (
                  <FeedCard
                    key={`${activeTab}-${item.id}`}
                    item={item}
                    isOwn={activeTab === 'history'}
                    onClick={() => onItemClick?.(item)}
                    onVisibilityToggle={
                      activeTab === 'history'
                        ? (isPublic) => handleVisibilityToggle(item.id, isPublic)
                        : undefined
                    }
                    index={currentIndex}
                  />
                );
              })}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Indicator */}
      <div
        ref={loaderRef}
        className="flex items-center justify-center py-12"
      >
        {isLoading && <LoadingIndicator />}
        {!hasMore && items.length > 0 && <EndMessage />}
      </div>

      {/* Empty State */}
      <AnimatePresence>
        {!isLoading && items.length === 0 && (
          <EmptyState activeTab={activeTab} />
        )}
      </AnimatePresence>
    </div>
  );
}
