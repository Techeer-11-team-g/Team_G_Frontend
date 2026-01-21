import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { Heart, Globe, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { feedApi } from '@/api';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import { toast } from 'sonner';
import type { FeedItem } from '@/types/api';

type FeedTab = 'discover' | 'history';

interface CircularCarouselProps {
  className?: string;
  onItemClick?: (item: FeedItem) => void;
}

// 2D Arc/Fan configuration - cards spread like a hand of cards
// CLEAN GAPS: Cards should NOT overlap - premium spacing
const ARC_CONFIG = {
  // Number of visible cards on each side of center
  visibleSideCards: 2,
  // Arc radius for positioning (how wide the arc spreads)
  arcRadius: 400,
  // Maximum rotation angle for outermost cards (degrees) - very subtle fan effect
  maxRotation: 6,
  // Base horizontal spacing between card centers
  // Card width is ~160-192px, spacing needs to be > card width for gaps
  // At scale 0.7, card is ~112-134px wide, so 180px spacing gives ~50px gap
  horizontalSpread: 200,
  // Vertical arc offset - subtle downward curve for side cards
  verticalArc: 40,
  // Scale reduction for side cards - creates depth & prevents overlap
  minScale: 0.65,
  // Opacity reduction for side cards
  minOpacity: 0.35,
  // Auto-scroll interval in ms
  autoScrollInterval: 4000,
  // Animation duration for transitions
  transitionDuration: 0.5,
  // Transform origin Y offset for rotation pivot (cards rotate from bottom)
  rotationOriginY: 150,
  // Progressive gap increase for outer cards (pixels)
  progressiveGap: 40,
  // Center card scale boost for prominence
  centerScaleBoost: 1.05,
};

// Easing curves - smooth without wobble
const SPRING_CONFIG = {
  stiffness: 300,
  damping: 35,
  mass: 0.8,
};

// Single Card Component - 2D Arc/Fan Style
function ConveyorCard({
  item,
  offset,
  onClick,
  onVisibilityToggle,
  isOwn,
}: {
  item: FeedItem;
  offset: number; // -2 to 2, 0 is center
  onClick: () => void;
  onVisibilityToggle?: (isPublic: boolean) => void;
  isOwn: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Calculate 2D arc transforms based on offset
  // Clamp offset to visible range
  const normalizedOffset = Math.max(-ARC_CONFIG.visibleSideCards, Math.min(ARC_CONFIG.visibleSideCards, offset));
  const absOffset = Math.abs(normalizedOffset);
  const isCenter = absOffset < 0.5;

  // X position - progressive spacing that INCREASES for outer cards to prevent overlap
  // Uses quadratic curve so outer cards have proportionally more space
  const sign = normalizedOffset >= 0 ? 1 : -1;
  const baseSpread = ARC_CONFIG.horizontalSpread;
  // Progressive gap: cards further from center get exponentially more spacing
  // This ensures no overlap even with rotation
  const progressiveGap = Math.pow(absOffset, 1.4) * ARC_CONFIG.progressiveGap;
  const x = sign * (absOffset * baseSpread + progressiveGap);

  // Y position - creates the arc curve (cards at edges are lower)
  // Smooth parabolic curve for elegant fan effect
  const yProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const y = Math.pow(yProgress, 1.8) * ARC_CONFIG.verticalArc;

  // 2D Rotation - cards fan outward like a hand of cards
  // More subtle rotation for cleaner look
  const rotationProgress = normalizedOffset / ARC_CONFIG.visibleSideCards;
  const rotation = rotationProgress * ARC_CONFIG.maxRotation;

  // Scale - center card is boosted, side cards scale down progressively
  const scaleProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const baseScale = 1 - scaleProgress * (1 - ARC_CONFIG.minScale);
  // Apply center boost for prominence
  const scale = isCenter ? baseScale * ARC_CONFIG.centerScaleBoost : baseScale;

  // Opacity - smooth fade toward edges with better curve
  const opacityProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const opacity = 1 - Math.pow(opacityProgress, 1.5) * (1 - ARC_CONFIG.minOpacity);

  // Z-index - center card is clearly on top, dramatic layering
  const zIndex = 100 - Math.round(absOffset * 20);

  const primaryObject = item.detected_objects?.[0];

  const handleVisibilityToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling || !onVisibilityToggle) return;
    setIsToggling(true);
    haptic('tap');
    try {
      await onVisibilityToggle(!item.is_public);
    } finally {
      setIsToggling(false);
    }
  };

  // Shadow based on position - center cards have more prominent shadows
  const shadowIntensity = (1 - absOffset / ARC_CONFIG.visibleSideCards) * 0.8;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        zIndex,
        // 2D transform origin - rotate from bottom center for fan effect
        transformOrigin: `center ${ARC_CONFIG.rotationOriginY}%`,
      }}
      animate={{
        x,
        y,
        rotate: rotation,
        scale,
        opacity: absOffset > ARC_CONFIG.visibleSideCards ? 0 : opacity,
      }}
      transition={{
        type: 'spring',
        ...SPRING_CONFIG,
      }}
      onClick={onClick}
      whileHover={isCenter ? { scale: scale * 1.02, y: y - 6 } : undefined}
      whileTap={{ scale: scale * 0.98 }}
    >
      <motion.div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          // Smaller cards for cleaner gaps - w-40 (160px) on mobile, w-48 (192px) on desktop
          "w-40 md:w-48",
          isCenter && "ring-2 ring-white/30"
        )}
        style={{
          background: 'linear-gradient(165deg, rgba(32,32,36,0.97) 0%, rgba(18,18,22,0.99) 100%)',
          boxShadow: isCenter
            ? `0 ${24 * shadowIntensity}px ${48 * shadowIntensity}px -12px rgba(0,0,0,0.85),
               0 ${12 * shadowIntensity}px ${24 * shadowIntensity}px -8px rgba(0,0,0,0.4),
               0 0 0 1px rgba(255,255,255,0.1)`
            : `0 ${10 * shadowIntensity}px ${30 * shadowIntensity}px -8px rgba(0,0,0,0.5),
               0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <motion.img
            src={item.uploaded_image_url}
            alt="Feed item"
            className="w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: loaded ? 1 : 0,
              scale: loaded ? 1 : 1.1
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

          {/* User info (Discover) */}
          {!isOwn && item.user && (
            <motion.div
              className="absolute top-3 left-3 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-[10px] text-white font-bold">
                  {item.user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-white/80 font-medium drop-shadow-lg">
                {item.user.username}
              </span>
            </motion.div>
          )}

          {/* Visibility toggle (History) */}
          {isOwn && (
            <motion.button
              onClick={handleVisibilityToggle}
              disabled={isToggling}
              className={cn(
                "absolute top-3 right-3 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all",
                item.is_public
                  ? "bg-emerald-500/25 border-emerald-500/30"
                  : "bg-black/40 border-white/10"
              )}
              style={{
                backdropFilter: 'blur(8px)',
                border: '1px solid',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              {item.is_public ? (
                <Globe size={12} className="text-emerald-400" />
              ) : (
                <Lock size={12} className="text-white/50" />
              )}
              <span className={cn(
                "text-[10px] font-medium",
                item.is_public ? "text-emerald-400" : "text-white/50"
              )}>
                {item.is_public ? '공개' : '비공개'}
              </span>
            </motion.button>
          )}

          {/* Category Tags */}
          {item.detected_objects && item.detected_objects.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              {item.detected_objects.slice(0, 2).map((obj, idx) => (
                <motion.span
                  key={obj.id}
                  className="px-2 py-0.5 rounded-full text-[9px] text-white/90 font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx + 0.3 }}
                >
                  {obj.category}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        {primaryObject?.matched_product && (
          <motion.div
            className="p-3 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">
              {primaryObject.matched_product.brand_name}
            </p>
            <p className="text-xs text-white/85 line-clamp-1 mt-1 font-medium">
              {primaryObject.matched_product.product_name}
            </p>
            <p className="text-sm text-white font-bold mt-1.5">
              {primaryObject.matched_product.selling_price?.toLocaleString()}원
            </p>
          </motion.div>
        )}

        {/* Center Card Glow Effect */}
        {isCenter && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 25%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Progress Indicator Dots
function CarouselDots({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}) {
  const visibleDots = Math.min(total, 7);
  const startIndex = Math.max(0, Math.min(current - 3, total - visibleDots));

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: visibleDots }).map((_, i) => {
        const actualIndex = startIndex + i;
        const isActive = actualIndex === current;
        const distance = Math.abs(actualIndex - current);

        return (
          <motion.button
            key={actualIndex}
            onClick={() => {
              haptic('tap');
              onDotClick(actualIndex);
            }}
            className="relative"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="rounded-full"
              animate={{
                width: isActive ? 24 : 8,
                height: 8,
                backgroundColor: isActive
                  ? 'rgba(255,255,255,0.9)'
                  : `rgba(255,255,255,${0.3 - distance * 0.05})`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

// Main Carousel Component
export function CircularCarousel({ className, onItemClick }: CircularCarouselProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current position in the carousel (can be fractional during drag)
  const position = useMotionValue(0);
  const smoothPosition = useSpring(position, SPRING_CONFIG);

  // Active index derived from position
  const [activeIndex, setActiveIndex] = useState(0);

  // Save positions per tab
  const savedPositions = useRef<Record<FeedTab, number>>({
    discover: 0,
    history: 0,
  });
  const previousTab = useRef<FeedTab>(activeTab);

  // Interaction states
  const isDragging = useRef(false);
  const isHovering = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);
  const autoScrollRef = useRef<number | null>(null);

  // Fetch items
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
  }, [activeTab, position, smoothPosition]);

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

  // Update active index when position changes
  useEffect(() => {
    const unsubscribe = smoothPosition.on('change', (value) => {
      if (items.length === 0) return;
      const newIndex = Math.round(value);
      const clampedIndex = ((newIndex % items.length) + items.length) % items.length;
      setActiveIndex(clampedIndex);
    });
    return () => unsubscribe();
  }, [smoothPosition, items.length]);

  // Auto-scroll functionality
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return;
    if (items.length <= 1) return;

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
  }, [position, items.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Start auto-scroll when items load
  useEffect(() => {
    if (items.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [items.length, startAutoScroll, stopAutoScroll]);

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

  // Visibility toggle handler
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

  // Calculate visible items with their offsets
  // Uses activeIndex (snapped integer) for center, smoothPosition for animation
  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    const result: Array<{ item: FeedItem; offset: number; index: number }> = [];
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
      <div className="relative z-10 py-6 px-4">
        <div
          className="flex items-center justify-center gap-1 p-1.5 rounded-2xl max-w-xs mx-auto"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {(['discover', 'history'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors",
                activeTab === tab ? "text-black" : "text-white/40 hover:text-white/70"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-xl"
                  layoutId="conveyorTabBg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                {tab === 'discover' ? (
                  <>
                    <Globe size={14} />
                    <span>Discover</span>
                  </>
                ) : (
                  <>
                    <Heart size={14} />
                    <span>History</span>
                  </>
                )}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

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
