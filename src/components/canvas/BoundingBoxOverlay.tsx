import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { springs } from '@/motion';
import type { ChatProduct } from '@/types/api';

interface BoundingBoxOverlayProps {
  product: ChatProduct;
  idx: number;
  imageSize: { width: number; height: number };
  isSelected: boolean;
  isHovered: boolean;
  isMobile: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function BoundingBoxOverlay({
  product,
  idx,
  imageSize,
  isSelected,
  isHovered,
  isMobile,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: BoundingBoxOverlayProps) {
  const bbox = product.bbox!;

  // Calculate position from normalized coordinates (0-1)
  const left = bbox.x1 * imageSize.width;
  const top = bbox.y1 * imageSize.height;
  const width = (bbox.x2 - bbox.x1) * imageSize.width;
  const height = (bbox.y2 - bbox.y1) * imageSize.height;

  // Badge position inside bbox - rotate corners
  const badgePositions = [
    { top: 4, left: 4 },
    { top: 4, right: 4 },
    { bottom: 4, left: 4 },
    { bottom: 4, right: 4 },
  ];
  const badgePos = badgePositions[idx % 4];

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left,
        top,
        width,
        height,
        touchAction: 'pan-y',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + (product.index || 0) * 0.1 }}
    >
      {/* Bounding box border */}
      <motion.div
        className="absolute inset-0 rounded-md md:rounded-lg"
        style={{
          border: isSelected
            ? '3px solid rgba(255, 255, 255, 0.95)'
            : isHovered
            ? '2px solid rgba(255, 255, 255, 0.7)'
            : '2px solid rgba(255, 255, 255, 0.5)',
          background: isSelected
            ? 'rgba(255, 255, 255, 0.2)'
            : isHovered
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.05)',
          boxShadow: isSelected
            ? '0 0 30px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            : '0 0 15px rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          scale: isSelected ? 1.02 : 1,
        }}
        transition={springs.snappy}
      />

      {/* Index badge */}
      <motion.div
        className={cn(
          "absolute rounded-full flex items-center justify-center z-10",
          isMobile ? "w-6 h-6" : "w-7 h-7"
        )}
        style={{
          ...badgePos,
          background: isSelected
            ? 'white'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.3)',
        }}
        animate={{
          scale: isSelected || isHovered ? 1.15 : 1,
        }}
      >
        <span
          className={cn(
            'font-bold text-black',
            isMobile ? 'text-[10px]' : 'text-xs'
          )}
        >
          {product.index || idx + 1}
        </span>
      </motion.div>

      {/* Pulse animation */}
      {!isSelected && (
        <motion.div
          className="absolute inset-0 rounded-md md:rounded-lg border-2 border-white/40"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
