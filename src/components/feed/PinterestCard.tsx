import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import type { FeedItem } from '@/types/api';

export interface PinterestCardProps {
  item: FeedItem;
  onClick: () => void;
  onVisibilityToggle?: (isPublic: boolean) => void;
  isOwn: boolean;
  /** Index in the feed list - used for loading priority */
  index?: number;
}

export const PinterestCard = memo(function PinterestCard({
  item,
  onClick,
  onVisibilityToggle,
  isOwn,
  index = 0,
}: PinterestCardProps) {
  // First 12 images get priority loading
  const isPriority = index < 12;
  const [loaded, setLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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

  return (
    <motion.div
      className="group cursor-pointer"
      style={{ touchAction: 'pan-y' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Placeholder while loading */}
        {!loaded && <div className="aspect-[3/4] w-full animate-pulse bg-zinc-800" />}

        {/* Image - natural aspect ratio */}
        <img
          src={item.uploaded_image_url}
          alt="Feed item"
          className={cn(
            'w-full select-none object-cover transition-transform duration-300 group-hover:scale-105',
            !loaded && 'hidden'
          )}
          style={{ touchAction: 'pan-y', pointerEvents: 'none' }}
          onLoad={() => setLoaded(true)}
          draggable={false}
          loading={isPriority ? 'eager' : 'lazy'}
          decoding={isPriority ? 'sync' : 'async'}
          fetchPriority={index === 0 ? 'high' : undefined}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* User info (Discover) - shows on hover */}
        {!isOwn && item.user && (
          <motion.div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-[10px] font-bold text-white">
                {item.user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-white drop-shadow-lg">
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
              'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all',
              item.is_public
                ? 'border-emerald-500/30 bg-emerald-500/25'
                : 'border-white/10 bg-black/40'
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
            <span
              className={cn(
                'text-[10px] font-medium',
                item.is_public ? 'text-emerald-400' : 'text-white/50'
              )}
            >
              {item.is_public ? '공개' : '비공개'}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});
