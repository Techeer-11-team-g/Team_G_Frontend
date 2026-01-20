import { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  PanInfo,
  AnimatePresence,
} from 'framer-motion';
import { Heart, X, Sparkles, ShoppingBag } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import type { ProductCandidate } from '@/types/api';

interface SwipeableCardProps {
  product: ProductCandidate;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onTryOn?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;

export function SwipeableCard({
  product,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onTryOn,
  onAddToCart,
  className,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState<'left' | 'right' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Motion values for swipe
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 3D tilt effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring for smooth return
  const springX = useSpring(x, springs.snappy);
  const springY = useSpring(y, springs.snappy);

  // Transforms based on drag
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const scale = useTransform(
    x,
    [-200, 0, 200],
    [0.95, 1, 0.95]
  );

  // Indicator opacity based on swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Background color based on swipe
  const backgroundColor = useTransform(
    x,
    [-200, 0, 200],
    [
      'rgba(239, 68, 68, 0.1)',
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0.1)',
    ]
  );

  // Handle 3D tilt on pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    haptic('select');
  };

  // Handle drag end
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);

    const shouldSwipe =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
      Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setIsExiting(direction);
      haptic('success');

      setTimeout(() => {
        if (direction === 'right') {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }, 200);
    }
  };

  // Render action indicator
  const renderIndicator = (type: 'like' | 'nope') => {
    const isLike = type === 'like';
    return (
      <motion.div
        className={cn(
          'absolute top-4 z-10 px-4 py-2 rounded-lg',
          'border-2 font-bold text-sm tracking-wider',
          'transform rotate-12',
          isLike
            ? 'right-4 border-green-500 text-green-500 -rotate-12'
            : 'left-4 border-red-500 text-red-500 rotate-12'
        )}
        style={{ opacity: isLike ? likeOpacity : nopeOpacity }}
      >
        {isLike ? 'LIKE' : 'NOPE'}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          ref={cardRef}
          className={cn(
            'relative rounded-2xl overflow-hidden',
            'bg-white/[0.02] border border-white/5',
            'cursor-grab active:cursor-grabbing',
            'touch-none select-none',
            className
          )}
          style={{
            x: springX,
            y: springY,
            rotate,
            scale,
            rotateX,
            rotateY,
            backgroundColor,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onTap={() => {
            if (!isDragging) {
              haptic('tap');
              onTap?.();
            }
          }}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            x: isExiting === 'right' ? 500 : -500,
            opacity: 0,
            rotate: isExiting === 'right' ? 30 : -30,
            transition: { duration: 0.3 },
          }}
          transition={springs.bouncy}
          whileHover={{ scale: isDragging ? 1 : 1.02 }}
        >
          {/* Swipe indicators */}
          {renderIndicator('like')}
          {renderIndicator('nope')}

          {/* Product Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}

            <motion.img
              src={product.image_url || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Match score badge */}
            {product.similarity_score !== undefined && (
              <motion.div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent/90 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, ...springs.bouncy }}
              >
                <span className="text-[10px] font-mono font-medium text-white">
                  {Math.round(product.similarity_score * 100)}% Match
                </span>
              </motion.div>
            )}

            {/* Quick action buttons */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic('tap');
                  onTryOn?.();
                }}
                className={cn(
                  'w-10 h-10 rounded-full',
                  'bg-white/10 backdrop-blur-sm',
                  'flex items-center justify-center',
                  'hover:bg-white/20 transition-colors'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Sparkles size={16} className="text-white" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic('tap');
                  onAddToCart?.();
                }}
                className={cn(
                  'w-10 h-10 rounded-full',
                  'bg-accent/90 backdrop-blur-sm',
                  'flex items-center justify-center',
                  'hover:bg-accent transition-colors'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingBag size={16} className="text-white" />
              </motion.button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-[9px] font-mono tracking-widest text-white/40 uppercase mb-1">
              {product.brand || 'Brand'}
            </p>
            <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
              {product.name}
            </h3>
            <p className="text-base font-semibold text-white">
              {typeof product.price === 'number'
                ? `${product.price.toLocaleString()}원`
                : product.price}
            </p>
          </div>

          {/* Bottom action buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-0">
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExiting('left');
                  haptic('tap');
                  setTimeout(() => onSwipeLeft?.(), 200);
                }}
                className={cn(
                  'w-12 h-12 rounded-full',
                  'bg-white/5 border border-white/10',
                  'flex items-center justify-center',
                  'hover:bg-red-500/20 hover:border-red-500/50',
                  'transition-colors'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-white/60" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExiting('right');
                  haptic('success');
                  setTimeout(() => onSwipeRight?.(), 200);
                }}
                className={cn(
                  'w-12 h-12 rounded-full',
                  'bg-white/5 border border-white/10',
                  'flex items-center justify-center',
                  'hover:bg-green-500/20 hover:border-green-500/50',
                  'transition-colors'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={20} className="text-white/60" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
