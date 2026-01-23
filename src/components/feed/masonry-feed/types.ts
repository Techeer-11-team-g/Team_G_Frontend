import type { FeedItem } from '@/types/api';

export type FeedTab = 'discover' | 'history';

// Card size variants for visual interest
export type CardVariant = 'compact' | 'standard' | 'featured';

export interface MasonryFeedProps {
  className?: string;
  onItemClick?: (item: FeedItem) => void;
}

export interface FeedCardProps {
  item: FeedItem;
  onClick?: () => void;
  onVisibilityToggle?: (isPublic: boolean) => void;
  isOwn?: boolean;
  index?: number;
}

export interface TabHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

// Generate pseudo-random but consistent aspect ratio based on item id
export function getAspectRatio(id: number): number {
  // Use item id to generate consistent "random" ratio
  const seed = (id * 9301 + 49297) % 233280;
  const random = seed / 233280;

  // Generate ratios between 0.7 (tall) and 1.4 (wide)
  // Weighted towards taller images for Pinterest feel
  const ratios = [0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 1.0, 1.1, 1.2];
  const index = Math.floor(random * ratios.length);
  return ratios[index];
}

export function getCardVariant(id: number, index: number): CardVariant {
  // Every 5th item is featured, some are compact
  if (index % 7 === 0) return 'featured';
  if (id % 3 === 0) return 'compact';
  return 'standard';
}
