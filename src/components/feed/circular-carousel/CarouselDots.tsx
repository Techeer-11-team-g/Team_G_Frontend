import { memo } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '@/motion';
import type { CarouselDotsProps } from './types';

export const CarouselDots = memo(function CarouselDots({
  total,
  current,
  onDotClick,
}: CarouselDotsProps) {
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
});
