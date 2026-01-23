import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { springs } from '@/motion';
import type { DetectedObjectsProps } from './types';

export const DetectedObjects = memo(function DetectedObjects({
  objectsWithBBox,
  selectedObjectId,
  isActive,
  imageSize,
  imageLoaded,
  onBBoxClick,
}: DetectedObjectsProps) {
  if (!imageLoaded || imageSize.width === 0) return null;

  return (
    <>
      {objectsWithBBox.map((obj, idx) => {
        const bbox = obj.bbox!;
        const isSelected = selectedObjectId === obj.id;

        const left = bbox.x1 * imageSize.width;
        const top = bbox.y1 * imageSize.height;
        const width = (bbox.x2 - bbox.x1) * imageSize.width;
        const height = (bbox.y2 - bbox.y1) * imageSize.height;

        return (
          <motion.div
            key={obj.id}
            className="absolute cursor-pointer"
            style={{ left, top, width, height }}
            onClick={(e) => onBBoxClick(e, obj.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isActive ? 1 : 0.5, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                border: isSelected
                  ? '3px solid rgba(255, 255, 255, 0.95)'
                  : '2px solid rgba(255, 255, 255, 0.5)',
                background: isSelected
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isSelected
                  ? '0 0 30px rgba(255, 255, 255, 0.4)'
                  : '0 0 15px rgba(255, 255, 255, 0.2)',
              }}
              animate={{ scale: isSelected ? 1.02 : 1 }}
              transition={springs.snappy}
            />

            {/* Index Badge */}
            <motion.div
              className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: isSelected ? 'white' : 'rgba(255,255,255,0.9)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <span className="text-[10px] font-bold text-black">{idx + 1}</span>
            </motion.div>

            {/* Pulse */}
            {!isSelected && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-white/40"
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.01, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </>
  );
});

export const CategoryChips = memo(function CategoryChips({
  objectsWithBBox,
  selectedObjectId,
  onBBoxClick,
}: Pick<DetectedObjectsProps, 'objectsWithBBox' | 'selectedObjectId' | 'onBBoxClick'>) {
  if (objectsWithBBox.length === 0) return null;

  return (
    <motion.div
      className="mt-4 flex flex-wrap justify-center gap-2 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {objectsWithBBox.map((obj, idx) => {
        const isSelected = selectedObjectId === obj.id;
        return (
          <motion.button
            key={obj.id}
            onClick={(e) => onBBoxClick(e, obj.id)}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 transition-all',
              isSelected
                ? 'bg-white text-black'
                : 'border border-white/20 bg-white/10 text-white/70'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                isSelected ? 'bg-black text-white' : 'bg-white/20 text-white'
              )}
            >
              {idx + 1}
            </span>
            <span className="text-xs font-medium">{obj.category}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
});

export const TapHint = memo(function TapHint({
  show,
}: {
  show: boolean;
}) {
  if (!show) return null;

  return (
    <motion.div
      className="absolute bottom-4 left-0 right-0 flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
        <p className="text-xs text-white/70">아이템을 탭하여 상품 정보 확인</p>
      </div>
    </motion.div>
  );
});
