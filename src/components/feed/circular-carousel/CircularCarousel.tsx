import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';

import { ARC_CONFIG, type CircularCarouselProps } from './types';
import { ConveyorCard } from './ConveyorCard';
import { CarouselDots } from './CarouselDots';
import { TabHeader } from './TabHeader';
import {
  useCarouselState,
  useFeedFetch,
  useCarouselNavigation,
  useVisibilityToggle,
} from './hooks';

export function CircularCarousel({ className, onItemClick }: CircularCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeTab,
    setActiveTab,
    items,
    setItems,
    isLoading,
    setIsLoading,
    activeIndex,
    setActiveIndex,
    position,
    smoothPosition,
    savedPositions,
    previousTab,
  } = useCarouselState();

  useFeedFetch(
    activeTab,
    position,
    smoothPosition,
    setItems,
    setActiveIndex,
    setIsLoading,
    savedPositions,
    previousTab,
    activeIndex
  );

  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    goToIndex,
    goNext,
    goPrev,
    handleMouseEnter,
    handleMouseLeave,
  } = useCarouselNavigation(position, smoothPosition, items.length, setActiveIndex);

  const handleVisibilityToggle = useVisibilityToggle(setItems);

  // Calculate visible items with their offsets
  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    const result: Array<{ item: typeof items[0]; offset: number; index: number }> = [];
    const range = ARC_CONFIG.visibleSideCards + 1;

    // Use activeIndex as the center - this is already rounded/snapped
    for (let i = -range; i <= range; i++) {
      const index = ((activeIndex + i) % items.length + items.length) % items.length;
      // Offset is simply the distance from center (integer-based)
      const offset = i;
      result.push({ item: items[index], offset, index });
    }

    return result;
  }, [items, activeIndex]);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Header */}
      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2D Arc Carousel Container - No 3D perspective */}
      <div
        ref={containerRef}
        className="relative h-[480px] md:h-[560px] overflow-hidden select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {/* Ambient Background Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(255,255,255,0.02) 0%, transparent 70%)',
          }}
        />

        {/* Carousel Stage - 2D positioning */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="w-10 h-10 rounded-full"
                style={{
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: 'rgba(255,255,255,0.6)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-white/30 text-sm font-medium">Loading...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && items.length === 0 && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {activeTab === 'discover' ? (
                  <Globe size={32} className="text-white/15" />
                ) : (
                  <Heart size={32} className="text-white/15" />
                )}
              </div>
              <p className="text-white/30 text-sm">
                {activeTab === 'discover'
                  ? '공개된 스타일이 없습니다'
                  : '분석한 이미지가 없습니다'}
              </p>
            </motion.div>
          )}

          {/* Cards */}
          {!isLoading && items.length > 0 && visibleItems.map(({ item, offset, index }) => {
            const isCenterCard = Math.abs(offset) < 0.5;
            return (
              <ConveyorCard
                key={`${activeTab}-${item.id}-${index}`}
                item={item}
                offset={offset}
                isOwn={activeTab === 'history'}
                onClick={() => {
                  if (isCenterCard) {
                    haptic('tap');
                    onItemClick?.(item);
                  } else {
                    // Click on side card navigates to it
                    goToIndex(Math.round(position.get() + offset));
                  }
                }}
                onVisibilityToggle={
                  activeTab === 'history'
                    ? (isPublic) => handleVisibilityToggle(item.id, isPublic)
                    : undefined
                }
              />
            );
          })}
        </div>

        {/* Navigation Arrows - wrapped in container for consistent alignment */}
        {items.length > 1 && (
          <div className="absolute inset-x-0 top-[45%] -translate-y-1/2 z-50 flex justify-between items-center px-4 md:px-12 pointer-events-none">
            <motion.button
              onClick={goPrev}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center pointer-events-auto"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{
                scale: 1.1,
                background: 'rgba(0,0,0,0.6)',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={20} className="text-white/80" />
            </motion.button>
            <motion.button
              onClick={goNext}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center pointer-events-auto"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{
                scale: 1.1,
                background: 'rgba(0,0,0,0.6)',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={20} className="text-white/80" />
            </motion.button>
          </div>
        )}

        {/* Subtle Hint */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/20 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span>드래그하여 탐색</span>
          <span className="text-white/10">|</span>
          <span>호버시 일시정지</span>
        </motion.div>
      </div>

      {/* Progress Dots */}
      {items.length > 1 && (
        <CarouselDots
          total={items.length}
          current={activeIndex}
          onDotClick={goToIndex}
        />
      )}
    </div>
  );
}
