import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUserStore } from '@/store';
import { haptic } from '@/motion';
import { ExpandedPost } from './expanded-post';
import type { FeedItem } from '@/types/api';

export interface ExpandedPostViewProps {
  items: FeedItem[];
  initialIndex: number;
  isOwn: boolean;
  onClose: () => void;
  onVisibilityToggle: (itemId: number, isPublic: boolean) => Promise<void>;
}

export function ExpandedPostView({
  items,
  initialIndex,
  isOwn,
  onClose,
  onVisibilityToggle,
}: ExpandedPostViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useUserStore();

  // Scroll to initial post immediately (no animation)
  useEffect(() => {
    if (scrollRef.current && !isInitialized) {
      const postHeight = window.innerHeight;
      scrollRef.current.scrollTop = initialIndex * postHeight;
      // Enable smooth scroll after initial position is set
      requestAnimationFrame(() => {
        setIsInitialized(true);
      });
    }
  }, [initialIndex, isInitialized]);

  // Track scroll position to update current index
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const postHeight = window.innerHeight;
      const newIndex = Math.round(scrollRef.current.scrollTop / postHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
        setCurrentIndex(newIndex);
        haptic('tap');
      }
    };

    const container = scrollRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [currentIndex, items.length]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="absolute right-4 z-50 rounded-full bg-black/50 p-3 backdrop-blur-sm"
        style={{ top: 'max(48px, calc(env(safe-area-inset-top) + 12px))' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={24} className="text-white" />
      </motion.button>

      {/* Scrollable Posts Container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        style={{
          scrollBehavior: isInitialized ? 'smooth' : 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item, index) => (
          <ExpandedPost
            key={item.id}
            item={item}
            isOwn={isOwn}
            isActive={index === currentIndex}
            onVisibilityToggle={onVisibilityToggle}
            onProductPanelChange={() => {}}
            user={user}
          />
        ))}
      </div>
    </motion.div>
  );
}
