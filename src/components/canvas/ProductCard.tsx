import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Shirt, ShoppingBag, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProductCandidate } from '@/types/api';

interface ProductCardProps {
  product: ProductCandidate;
  index?: number;
  onSelect?: () => void;
  onTryOn?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

export function ProductCard({
  product,
  index,
  onSelect,
  onTryOn,
  onAddToCart,
  className,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Magnetic tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-white/[0.02] border border-white/10',
        'cursor-pointer group',
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <motion.img
          src={product.image_url || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.05,
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Index Badge */}
        {index !== undefined && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[10px] font-mono text-white/70">{index}</span>
          </div>
        )}

        {/* Like Button */}
        <motion.button
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full',
            'flex items-center justify-center',
            'bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100',
            'transition-all',
            isLiked ? 'text-accent' : 'text-white/70'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Quick Actions (visible on hover) */}
        <motion.div
          className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ y: 10 }}
          whileHover={{ y: 0 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTryOn?.();
            }}
            className="flex-1 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-xs flex items-center justify-center gap-1 hover:bg-white/20 transition-colors"
          >
            <Shirt size={12} />
            <span>피팅</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="flex-1 py-2 rounded-lg bg-accent/90 backdrop-blur-sm text-white text-xs flex items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <ShoppingBag size={12} />
            <span>담기</span>
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <p className="text-[9px] font-mono tracking-wider text-white/40 mb-0.5">
          {product.brand?.toUpperCase() || 'BRAND'}
        </p>
        <h4 className="text-sm text-white/90 line-clamp-1 mb-1">
          {product.name}
        </h4>
        <p className="text-sm font-semibold text-white">
          {typeof product.price === 'number' ? `${product.price.toLocaleString()}원` : product.price}
        </p>
      </div>
    </motion.div>
  );
}

// Swipeable variant for decision-making
interface SwipeableProductCardProps extends ProductCardProps {
  onLike?: () => void;
  onSkip?: () => void;
}

export function SwipeableProductCard({
  product,
  onLike,
  onSkip,
  onSelect,
  className,
}: SwipeableProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: never, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onLike?.();
    } else if (info.offset.x < -100) {
      onSkip?.();
    }
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.02] border border-white/10',
        'cursor-grab active:cursor-grabbing',
        className
      )}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      {/* Like/Skip Indicators */}
      <motion.div
        className="absolute inset-0 bg-success/20 flex items-center justify-center z-10 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-4xl font-bold text-success">LIKE</span>
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-error/20 flex items-center justify-center z-10 pointer-events-none"
        style={{ opacity: skipOpacity }}
      >
        <span className="text-4xl font-bold text-error">SKIP</span>
      </motion.div>

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <img
          src={product.image_url || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs font-mono text-white/50 mb-1">
          {product.brand?.toUpperCase()}
        </p>
        <h3 className="text-lg font-medium text-white mb-1">{product.name}</h3>
        <p className="text-lg font-bold text-white">
          {typeof product.price === 'number' ? `${product.price.toLocaleString()}원` : product.price}
        </p>
      </div>
    </motion.div>
  );
}
