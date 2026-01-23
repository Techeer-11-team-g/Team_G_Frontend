import type { FeedItem } from '@/types/api';

export type FeedTab = 'discover' | 'history';

export interface CircularCarouselProps {
  className?: string;
  onItemClick?: (item: FeedItem) => void;
}

export interface ConveyorCardProps {
  item: FeedItem;
  offset: number;
  onClick: () => void;
  onVisibilityToggle?: (isPublic: boolean) => void;
  isOwn: boolean;
}

export interface CarouselDotsProps {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}

export interface TabHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

// 2D Arc/Fan configuration - cards spread like a hand of cards
// CLEAN GAPS: Cards should NOT overlap - premium spacing
export const ARC_CONFIG = {
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
export const SPRING_CONFIG = {
  stiffness: 300,
  damping: 35,
  mass: 0.8,
};
