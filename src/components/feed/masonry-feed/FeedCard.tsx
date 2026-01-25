import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import { getAspectRatio, getCardVariant, type FeedCardProps } from './types';

export const FeedCard = memo(function FeedCard({
  item,
  onClick,
  onVisibilityToggle,
  isOwn = false,
  index = 0,
}: FeedCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  // Get primary detected object
  const primaryObject = item.detected_objects?.[0];
  const variant = getCardVariant(item.id, index);

  // Use natural image ratio if loaded, otherwise use seeded pseudo-random ratio
  const aspectRatio = naturalRatio || getAspectRatio(item.id);

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setNaturalRatio(ratio);
    setLoaded(true);
  };

  // Staggered animation delay based on index
  const animationDelay = (index % 10) * 0.05;

  return (
    <motion.article
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        "rounded-2xl",
        variant === 'featured' && "rounded-3xl"
      )}
      style={{
        background: 'linear-gradient(145deg, rgba(28,28,30,0.9) 0%, rgba(18,18,20,0.95) 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.5,
        delay: animationDelay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Image Container with Natural Aspect Ratio */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
        }}
      >
        {/* Skeleton Loader */}
        <AnimatePresence>
          {!loaded && (
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Image */}
        <motion.img
          src={item.uploaded_image_url}
          alt="Feed item"
          className="absolute inset-0 w-full h-full object-cover"
          // First few images get priority loading for LCP optimization
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding={index < 4 ? 'sync' : 'async'}
          fetchPriority={index === 0 ? 'high' : undefined}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onLoad={handleImageLoad}
        />

        {/* Hover Zoom Effect */}
        <motion.div
          className="absolute inset-0 bg-black/0"
          animate={{
            backgroundColor: isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0)'
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Bottom Gradient for Text Legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)'
          }}
        />

        {/* Top Gradient for Badges */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)'
          }}
        />

        {/* User Info (Discover Tab) */}
        {!isOwn && item.user && (
          <motion.div
            className="absolute top-3 left-3 flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animationDelay + 0.2 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-[11px] text-white font-semibold">
                {item.user.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <span
              className="text-xs text-white font-medium px-2 py-1 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {item.user.username || 'Unknown'}
            </span>
          </motion.div>
        )}

        {/* Visibility Badge & Toggle (History Tab) */}
        {isOwn && (
          <motion.button
            onClick={handleVisibilityToggle}
            disabled={isToggling}
            className={cn(
              "absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5",
              "transition-all duration-300"
            )}
            style={{
              background: item.is_public
                ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.1) 100%)'
                : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              border: item.is_public
                ? '1px solid rgba(34,197,94,0.4)'
                : '1px solid rgba(255,255,255,0.15)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isToggling ? (
              <motion.div
                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
              />
            ) : item.is_public ? (
              <>
                <Globe size={13} className="text-green-400" />
                <span className="text-[11px] text-green-400 font-medium">공개</span>
              </>
            ) : (
              <>
                <Lock size={13} className="text-white/70" />
                <span className="text-[11px] text-white/70 font-medium">비공개</span>
              </>
            )}
          </motion.button>
        )}

        {/* Analysis Status Badge (History Tab) */}
        {isOwn && item.analysis_status !== 'DONE' && (
          <motion.div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.3) 0%, rgba(234,179,8,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(234,179,8,0.3)',
            }}
            animate={item.analysis_status === 'RUNNING' ? {
              boxShadow: [
                '0 0 0 0 rgba(234,179,8,0.4)',
                '0 0 0 8px rgba(234,179,8,0)',
              ]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {item.analysis_status === 'RUNNING' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={12} className="text-yellow-400" />
              </motion.div>
            )}
            <span className="text-[11px] text-yellow-400 font-medium">
              {item.analysis_status === 'RUNNING' ? '분석 중' :
               item.analysis_status === 'PENDING' ? '대기 중' : '실패'}
            </span>
          </motion.div>
        )}

        {/* Detected Objects Tags */}
        {item.detected_objects && item.detected_objects.length > 0 && (
          <motion.div
            className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay + 0.3 }}
          >
            {item.detected_objects.slice(0, variant === 'compact' ? 2 : 3).map((obj, i) => (
              <motion.span
                key={obj.id}
                className="px-2.5 py-1 rounded-full text-[10px] text-white font-medium"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animationDelay + 0.3 + (i * 0.05) }}
                whileHover={{
                  background: 'rgba(255,255,255,0.25)',
                  scale: 1.05
                }}
              >
                {obj.category}
              </motion.span>
            ))}
            {item.detected_objects.length > (variant === 'compact' ? 2 : 3) && (
              <span
                className="px-2 py-1 rounded-full text-[10px] text-white/60"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                +{item.detected_objects.length - (variant === 'compact' ? 2 : 3)}
              </span>
            )}
          </motion.div>
        )}

        {/* Hover Overlay - Save Button */}
        <motion.div
          className="absolute top-3 right-3 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHovered && !isOwn ? 1 : 0,
            scale: isHovered && !isOwn ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Heart size={18} className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div
        className={cn(
          "p-3",
          variant === 'compact' && "p-2.5",
          variant === 'featured' && "p-4"
        )}
        animate={{ opacity: loaded ? 1 : 0.5 }}
      >
        {/* Product Preview */}
        {primaryObject?.matched_product && (
          <div className="space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
              {primaryObject.matched_product.brand_name}
            </p>
            <p className={cn(
              "text-white/90 line-clamp-2 font-medium leading-tight",
              variant === 'compact' ? "text-xs" : "text-sm"
            )}>
              {primaryObject.matched_product.product_name}
            </p>
            <p className={cn(
              "text-white font-bold",
              variant === 'featured' ? "text-base" : "text-sm"
            )}>
              {primaryObject.matched_product.selling_price?.toLocaleString()}
              <span className="text-white/40 font-normal text-xs ml-0.5">원</span>
            </p>
          </div>
        )}

        {/* No Product - Show generic info */}
        {!primaryObject?.matched_product && variant !== 'compact' && (
          <div className="space-y-1">
            <p className="text-xs text-white/60 line-clamp-2">
              {item.detected_objects?.length
                ? `${item.detected_objects.length}개 아이템 감지됨`
                : '스타일 분석 완료'}
            </p>
          </div>
        )}

        {/* Date for History Tab */}
        {isOwn && (
          <p className="text-[10px] text-white/30 mt-2">
            {new Date(item.created_at).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </motion.div>

      {/* Subtle Border Glow on Hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: '1px solid transparent',
        }}
        animate={{
          borderColor: isHovered
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.05)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.article>
  );
});
