import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe } from 'lucide-react';
import { feedApi } from '@/api';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import { toast } from 'sonner';
import { PinterestCard } from './PinterestCard';
import { ExpandedPostView } from './ExpandedPostView';
import type { FeedItem, StyleOption } from '@/types/api';

type FeedTab = 'discover' | 'history';

export interface PinterestFeedProps {
  className?: string;
}

// Distribute items into columns evenly (like Pinterest)
function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export function PinterestFeed({ className }: PinterestFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [columnCount, setColumnCount] = useState(2);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Fetch styles on mount
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await feedApi.getStyles();
        setStyles(response.styles || []);
      } catch (error) {
        console.error('Failed to fetch styles:', error);
      }
    };
    fetchStyles();
  }, []);

  // Update column count based on screen width
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth >= 1024) {
        setColumnCount(4);
      } else if (window.innerWidth >= 768) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Fetch items
  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const response =
        activeTab === 'discover'
          ? await feedApi.getPublicFeed({ limit: 30, style: selectedStyle || undefined })
          : await feedApi.getMyHistory({ limit: 30 });
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedStyle]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Visibility toggle handler
  const handleVisibilityToggle = async (itemId: number, isPublic: boolean) => {
    try {
      await feedApi.toggleVisibility(itemId, { is_public: isPublic });
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_public: isPublic } : item))
      );
      toast.success(isPublic ? '공개로 변경되었습니다' : '비공개로 변경되었습니다');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('변경에 실패했습니다');
    }
  };

  // Memoize column distribution
  const columns = useMemo(
    () => distributeIntoColumns(items, columnCount),
    [items, columnCount]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-black via-black to-transparent px-4 pb-4 pt-16">
        <div
          className="mx-auto flex max-w-xs items-center justify-center gap-1 rounded-2xl p-1.5"
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
                'relative flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors',
                activeTab === tab ? 'text-black' : 'text-white/40 hover:text-white/70'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white"
                  layoutId="pinterestTabBg"
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

        {/* Style Filter Buttons - Only show on discover tab */}
        {activeTab === 'discover' && styles.length > 0 && (
          <motion.div
            className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-1 pb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              onClick={() => {
                haptic('tap');
                setSelectedStyle(null);
              }}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all',
                selectedStyle === null
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              )}
              whileTap={{ scale: 0.95 }}
            >
              전체
            </motion.button>
            {styles.map((style) => (
              <motion.button
                key={style.value}
                onClick={() => {
                  haptic('tap');
                  setSelectedStyle(style.value);
                }}
                className={cn(
                  'flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all',
                  selectedStyle === style.value
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                )}
                whileTap={{ scale: 0.95 }}
              >
                {style.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Pinterest Grid */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <motion.div
              className="h-10 w-10 rounded-full"
              style={{
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'rgba(255,255,255,0.6)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm text-white/30">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            className="py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
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
            <p className="text-sm text-white/30">
              {activeTab === 'discover' ? '공개된 스타일이 없습니다' : '분석한 이미지가 없습니다'}
            </p>
          </motion.div>
        ) : (
          <div className="flex gap-4">
            {columns.map((columnItems, colIndex) => (
              <div key={colIndex} className="flex flex-1 flex-col gap-4">
                {columnItems.map((item) => {
                  const originalIndex = items.findIndex((i) => i.id === item.id);
                  return (
                    <PinterestCard
                      key={item.id}
                      item={item}
                      isOwn={activeTab === 'history'}
                      onClick={() => {
                        haptic('tap');
                        setExpandedIndex(originalIndex);
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
            ))}
          </div>
        )}
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {expandedIndex !== null && items.length > 0 && (
          <ExpandedPostView
            items={items}
            initialIndex={expandedIndex}
            isOwn={activeTab === 'history'}
            onClose={() => setExpandedIndex(null)}
            onVisibilityToggle={handleVisibilityToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
