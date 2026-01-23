import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import { ARC_CONFIG, SPRING_CONFIG } from './types';
import type { ConveyorCardProps } from './types';

export const ConveyorCard = memo(function ConveyorCard({
  item,
  offset,
  onClick,
  onVisibilityToggle,
  isOwn,
}: ConveyorCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Calculate 2D arc transforms based on offset
  // Clamp offset to visible range
  const normalizedOffset = Math.max(-ARC_CONFIG.visibleSideCards, Math.min(ARC_CONFIG.visibleSideCards, offset));
  const absOffset = Math.abs(normalizedOffset);
  const isCenter = absOffset < 0.5;

  // X position - progressive spacing that INCREASES for outer cards to prevent overlap
  // Uses quadratic curve so outer cards have proportionally more space
  const sign = normalizedOffset >= 0 ? 1 : -1;
  const baseSpread = ARC_CONFIG.horizontalSpread;
  // Progressive gap: cards further from center get exponentially more spacing
  // This ensures no overlap even with rotation
  const progressiveGap = Math.pow(absOffset, 1.4) * ARC_CONFIG.progressiveGap;
  const x = sign * (absOffset * baseSpread + progressiveGap);

  // Y position - creates the arc curve (cards at edges are lower)
  // Smooth parabolic curve for elegant fan effect
  const yProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const y = Math.pow(yProgress, 1.8) * ARC_CONFIG.verticalArc;

  // 2D Rotation - cards fan outward like a hand of cards
  // More subtle rotation for cleaner look
  const rotationProgress = normalizedOffset / ARC_CONFIG.visibleSideCards;
  const rotation = rotationProgress * ARC_CONFIG.maxRotation;

  // Scale - center card is boosted, side cards scale down progressively
  const scaleProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const baseScale = 1 - scaleProgress * (1 - ARC_CONFIG.minScale);
  // Apply center boost for prominence
  const scale = isCenter ? baseScale * ARC_CONFIG.centerScaleBoost : baseScale;

  // Opacity - smooth fade toward edges with better curve
  const opacityProgress = absOffset / ARC_CONFIG.visibleSideCards;
  const opacity = 1 - Math.pow(opacityProgress, 1.5) * (1 - ARC_CONFIG.minOpacity);

  // Z-index - center card is clearly on top, dramatic layering
  const zIndex = 100 - Math.round(absOffset * 20);

  const primaryObject = item.detected_objects?.[0];

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

  // Shadow based on position - center cards have more prominent shadows
  const shadowIntensity = (1 - absOffset / ARC_CONFIG.visibleSideCards) * 0.8;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        zIndex,
        // 2D transform origin - rotate from bottom center for fan effect
        transformOrigin: `center ${ARC_CONFIG.rotationOriginY}%`,
      }}
      animate={{
        x,
        y,
        rotate: rotation,
        scale,
        opacity: absOffset > ARC_CONFIG.visibleSideCards ? 0 : opacity,
      }}
      transition={{
        type: 'spring',
        ...SPRING_CONFIG,
      }}
      onClick={onClick}
      whileHover={isCenter ? { scale: scale * 1.02, y: y - 6 } : undefined}
      whileTap={{ scale: scale * 0.98 }}
    >
      <motion.div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          // Smaller cards for cleaner gaps - w-40 (160px) on mobile, w-48 (192px) on desktop
          "w-40 md:w-48",
          isCenter && "ring-2 ring-white/30"
        )}
        style={{
          background: 'linear-gradient(165deg, rgba(32,32,36,0.97) 0%, rgba(18,18,22,0.99) 100%)',
          boxShadow: isCenter
            ? `0 ${24 * shadowIntensity}px ${48 * shadowIntensity}px -12px rgba(0,0,0,0.85),
               0 ${12 * shadowIntensity}px ${24 * shadowIntensity}px -8px rgba(0,0,0,0.4),
               0 0 0 1px rgba(255,255,255,0.1)`
            : `0 ${10 * shadowIntensity}px ${30 * shadowIntensity}px -8px rgba(0,0,0,0.5),
               0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <motion.img
            src={item.uploaded_image_url}
            alt="Feed item"
            className="w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: loaded ? 1 : 0,
              scale: loaded ? 1 : 1.1
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

          {/* User info (Discover) */}
          {!isOwn && item.user && (
            <motion.div
              className="absolute top-3 left-3 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-[10px] text-white font-bold">
                  {item.user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-white/80 font-medium drop-shadow-lg">
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
                "absolute top-3 right-3 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all",
                item.is_public
                  ? "bg-emerald-500/25 border-emerald-500/30"
                  : "bg-black/40 border-white/10"
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
              <span className={cn(
                "text-[10px] font-medium",
                item.is_public ? "text-emerald-400" : "text-white/50"
              )}>
                {item.is_public ? '공개' : '비공개'}
              </span>
            </motion.button>
          )}

          {/* Category Tags */}
          {item.detected_objects && item.detected_objects.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              {item.detected_objects.slice(0, 2).map((obj, idx) => (
                <motion.span
                  key={obj.id}
                  className="px-2 py-0.5 rounded-full text-[9px] text-white/90 font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx + 0.3 }}
                >
                  {obj.category}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        {primaryObject?.matched_product && (
          <motion.div
            className="p-3 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">
              {primaryObject.matched_product.brand_name}
            </p>
            <p className="text-xs text-white/85 line-clamp-1 mt-1 font-medium">
              {primaryObject.matched_product.product_name}
            </p>
            <p className="text-sm text-white font-bold mt-1.5">
              {primaryObject.matched_product.selling_price?.toLocaleString()}원
            </p>
          </motion.div>
        )}

        {/* Center Card Glow Effect */}
        {isCenter && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 25%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});
