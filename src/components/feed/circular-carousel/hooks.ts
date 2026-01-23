import { useState, useRef, useCallback, useEffect } from 'react';
import { useMotionValue, useSpring, animate } from 'framer-motion';
import { feedApi } from '@/api';
import { haptic } from '@/motion';
import { toast } from 'sonner';
import type { FeedItem } from '@/types/api';
import { ARC_CONFIG, SPRING_CONFIG, type FeedTab } from './types';

export function useCarouselState() {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Current position in the carousel (can be fractional during drag)
  const position = useMotionValue(0);
  const smoothPosition = useSpring(position, SPRING_CONFIG);

  // Save positions per tab
  const savedPositions = useRef<Record<FeedTab, number>>({
    discover: 0,
    history: 0,
  });
  const previousTab = useRef<FeedTab>(activeTab);

  return {
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
  };
}

export function useFeedFetch(
  activeTab: FeedTab,
  position: ReturnType<typeof useMotionValue<number>>,
  smoothPosition: ReturnType<typeof useSpring>,
  setItems: (items: FeedItem[]) => void,
  setActiveIndex: (index: number) => void,
  setIsLoading: (loading: boolean) => void,
  savedPositions: React.MutableRefObject<Record<FeedTab, number>>,
  previousTab: React.MutableRefObject<FeedTab>,
  activeIndex: number
) {
  const fetchFeed = useCallback(async (restorePosition: number = 0, skipAnimation: boolean = false) => {
    setIsLoading(true);
    try {
      const response = activeTab === 'discover'
        ? await feedApi.getPublicFeed({ limit: 20 })
        : await feedApi.getMyHistory({ limit: 20 });
      setItems(response.items || []);

      // Restore saved position or use provided position
      const targetPosition = Math.min(restorePosition, (response.items?.length || 1) - 1);

      if (skipAnimation) {
        // Jump directly without animation
        position.jump(targetPosition);
        smoothPosition.jump(targetPosition);
      } else {
        position.set(targetPosition);
      }
      setActiveIndex(targetPosition);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, position, smoothPosition, setItems, setActiveIndex, setIsLoading]);

  // Handle tab change - save current position and restore saved position for new tab
  useEffect(() => {
    const isTabChange = previousTab.current !== activeTab;

    if (isTabChange) {
      // Save current position for previous tab
      savedPositions.current[previousTab.current] = activeIndex;
      previousTab.current = activeTab;
    }

    // Fetch with restored position, skip animation on tab change
    const savedPos = savedPositions.current[activeTab];
    fetchFeed(savedPos, isTabChange);
  }, [activeTab]);

  return fetchFeed;
}

export function useCarouselNavigation(
  position: ReturnType<typeof useMotionValue<number>>,
  smoothPosition: ReturnType<typeof useSpring>,
  itemsLength: number,
  setActiveIndex: (index: number) => void
) {
  const isDragging = useRef(false);
  const isHovering = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);
  const autoScrollRef = useRef<number | null>(null);

  // Update active index when position changes
  useEffect(() => {
    const unsubscribe = smoothPosition.on('change', (value) => {
      if (itemsLength === 0) return;
      const newIndex = Math.round(value);
      const clampedIndex = ((newIndex % itemsLength) + itemsLength) % itemsLength;
      setActiveIndex(clampedIndex);
    });
    return () => unsubscribe();
  }, [smoothPosition, itemsLength, setActiveIndex]);

  // Auto-scroll functionality
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return;
    if (itemsLength <= 1) return;

    autoScrollRef.current = window.setInterval(() => {
      if (!isDragging.current && !isHovering.current) {
        const current = position.get();
        animate(position, current + 1, {
          type: 'spring',
          ...SPRING_CONFIG,
          duration: ARC_CONFIG.transitionDuration,
        });
      }
    }, ARC_CONFIG.autoScrollInterval);
  }, [position, itemsLength]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Start auto-scroll when items load
  useEffect(() => {
    if (itemsLength > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [itemsLength, startAutoScroll, stopAutoScroll]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragStartPosition.current = position.get();
    stopAutoScroll();
  }, [position, stopAutoScroll]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - clientX;
    const sensitivity = 0.005;
    position.set(dragStartPosition.current + delta * sensitivity);
  }, [position]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Snap to nearest card
    const current = position.get();
    const snapped = Math.round(current);
    animate(position, snapped, {
      type: 'spring',
      ...SPRING_CONFIG,
    });

    // Resume auto-scroll
    startAutoScroll();
  }, [position, startAutoScroll]);

  // Navigation handlers
  const goToIndex = useCallback((index: number) => {
    haptic('tap');
    animate(position, index, {
      type: 'spring',
      ...SPRING_CONFIG,
    });
  }, [position]);

  const goNext = useCallback(() => {
    haptic('tap');
    const current = position.get();
    animate(position, Math.round(current) + 1, {
      type: 'spring',
      ...SPRING_CONFIG,
    });
  }, [position]);

  const goPrev = useCallback(() => {
    haptic('tap');
    const current = position.get();
    animate(position, Math.round(current) - 1, {
      type: 'spring',
      ...SPRING_CONFIG,
    });
  }, [position]);

  // Mouse enter/leave for pause on hover
  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    if (!isDragging.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  return {
    isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    goToIndex,
    goNext,
    goPrev,
    handleMouseEnter,
    handleMouseLeave,
  };
}

export function useVisibilityToggle(
  setItems: React.Dispatch<React.SetStateAction<FeedItem[]>>
) {
  const handleVisibilityToggle = async (itemId: number, isPublic: boolean) => {
    try {
      await feedApi.toggleVisibility(itemId, { is_public: isPublic });
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
