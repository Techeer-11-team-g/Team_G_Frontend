import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProductCandidate } from '@/types/api';

interface HeroProductCardProps {
  product: ProductCandidate;
  onSelect?: () => void;
  onTryOn?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  className?: string;
}

export function HeroProductCard({
  product,
  onSelect,
  onTryOn,
  onAddToCart,
  onBuyNow,
  className,
}: HeroProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const matchScore = product.similarity_score !== undefined
    ? Math.round(product.similarity_score * 100)
    : null;

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.02] border border-white/10',
        'group cursor-pointer',
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <motion.img
          src={product.image_url || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.1,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Match Score Badge */}
        {matchScore && (
          <motion.div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/90 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles size={12} className="text-white" />
            <span className="text-xs font-mono font-medium text-white">
              {matchScore}% MATCH
            </span>
          </motion.div>
        )}

        {/* Like Button */}
        <motion.button
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-black/30 backdrop-blur-sm',
            'transition-colors',
            isLiked ? 'text-accent' : 'text-white/70'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            size={18}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        </motion.button>

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Brand */}
          <motion.p
            className="text-[10px] font-mono tracking-wider text-white/50 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {product.brand?.toUpperCase() || 'BRAND'}
          </motion.p>

          {/* Name */}
          <motion.h3
            className="text-lg font-medium text-white mb-2 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {product.name}
          </motion.h3>

          {/* Price */}
          <motion.p
            className="text-xl font-semibold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {typeof product.price === 'number' ? `${product.price.toLocaleString()}원` : product.price}
          </motion.p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-2">
        {/* Try On */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onTryOn?.();
          }}
          className={cn(
            'flex-1 py-3 rounded-xl',
            'flex items-center justify-center gap-2',
            'bg-white/5 border border-white/10',
            'text-white/80 text-sm',
            'hover:bg-white/10 transition-colors'
          )}
          whileTap={{ scale: 0.98 }}
        >
          <Shirt size={16} />
          <span>피팅</span>
        </motion.button>

        {/* Add to Cart */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
          className={cn(
            'flex-1 py-3 rounded-xl',
            'flex items-center justify-center gap-2',
            'bg-white/5 border border-white/10',
            'text-white/80 text-sm',
            'hover:bg-white/10 transition-colors'
          )}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingBag size={16} />
          <span>담기</span>
        </motion.button>

        {/* Buy Now */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onBuyNow?.();
          }}
          className={cn(
            'flex-1 py-3 rounded-xl',
            'flex items-center justify-center gap-2',
            'bg-accent hover:bg-accent-hover',
            'text-white text-sm font-medium',
            'transition-colors'
          )}
          whileTap={{ scale: 0.98 }}
        >
          <span>구매</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
