import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';
import type { ProductCandidate } from '@/types/api';

interface ProductBriefProps {
  product: ProductCandidate;
  showStartButton: boolean;
  showRetryOptions: boolean;
  onStartFitting: () => void;
  onTryOther: () => void;
}

export function ProductBrief({
  product,
  showStartButton,
  showRetryOptions,
  onStartFitting,
  onTryOther,
}: ProductBriefProps) {
  const handleStartFitting = () => {
    haptic('tap');
    onStartFitting();
  };

  const handleTryOther = () => {
    haptic('tap');
    onTryOther();
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: easings.smooth }}
    >
      {/* Product Info Card */}
      <motion.div
        className={cn(
          'relative rounded-2xl p-5 overflow-hidden',
          // Glassmorphism
          'bg-white/[0.03] backdrop-blur-xl',
          'border border-white/[0.08]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, ...springs.gentle }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        <div className="relative flex gap-4">
          {/* Product Image */}
          <motion.div
            className={cn(
              'w-20 h-24 rounded-xl overflow-hidden flex-shrink-0',
              'border border-white/[0.08]',
              'shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
            )}
            whileHover={{ scale: 1.02 }}
            transition={springs.snappy}
          >
            <img
              src={product.image_url || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <motion.p
              className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {product.brand || 'Brand'}
            </motion.p>
            <motion.h3
              className="text-sm font-light text-white/90 line-clamp-2 mb-2 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              {product.name}
            </motion.h3>
            <motion.p
              className="text-lg font-light text-white tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {typeof product.price === 'number'
                ? `${product.price.toLocaleString()}`
                : (product.price || '')}
              <span className="text-xs text-white/50 ml-1">KRW</span>
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <AnimatePresence mode="wait">
        {showStartButton && (
          <motion.button
            key="start"
            onClick={handleStartFitting}
            className={cn(
              'relative w-full py-4 rounded-xl overflow-hidden',
              'bg-white text-black',
              'font-light text-sm tracking-wide',
              'flex items-center justify-center gap-3',
              'shadow-[0_4px_24px_rgba(255,255,255,0.15)]',
              'hover:shadow-[0_6px_32px_rgba(255,255,255,0.2)]',
              'transition-all duration-300'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.6, ...springs.gentle }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
          >
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles size={16} />
            </motion.div>
            <span>Start Virtual Try-On</span>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.button>
        )}

        {showRetryOptions && (
          <motion.div
            key="retry"
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5, ...springs.gentle }}
          >
            <motion.button
              onClick={handleStartFitting}
              className={cn(
                'flex-1 py-4 rounded-xl',
                'text-[11px] font-mono uppercase tracking-[0.15em]',
                'flex items-center justify-center gap-2',
                // Glassmorphism button
                'bg-white/[0.03] backdrop-blur-sm',
                'border border-white/[0.1]',
                'text-white/70',
                'hover:bg-white/[0.06] hover:border-white/[0.15]',
                'hover:text-white/90',
                'transition-all duration-300'
              )}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </motion.button>

            <motion.button
              onClick={handleTryOther}
              className={cn(
                'flex-1 py-4 rounded-xl',
                'text-[11px] font-mono uppercase tracking-[0.15em]',
                'flex items-center justify-center gap-2',
                // Glassmorphism button
                'bg-white/[0.03] backdrop-blur-sm',
                'border border-white/[0.1]',
                'text-white/70',
                'hover:bg-white/[0.06] hover:border-white/[0.15]',
                'hover:text-white/90',
                'transition-all duration-300'
              )}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
            >
              <span>Browse More</span>
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Tip */}
      <motion.div
        className={cn(
          'relative p-4 rounded-xl overflow-hidden',
          // Glassmorphism
          'bg-white/[0.02] backdrop-blur-sm',
          'border border-white/[0.05]'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] via-transparent to-white/[0.01] pointer-events-none" />

        <div className="relative flex items-start gap-3">
          <motion.div
            className={cn(
              'w-6 h-6 rounded-full flex-shrink-0',
              'bg-white/[0.05] border border-white/[0.08]',
              'flex items-center justify-center'
            )}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Info size={12} className="text-white/40" />
          </motion.div>
          <div className="flex-1">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.15em] mb-1">
              Agent Note
            </p>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Virtual try-on uses AI to simulate how clothing fits your body.
              Results are for reference and may differ from actual wear.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
