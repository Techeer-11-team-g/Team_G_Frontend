import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';

interface FittingHeaderProps {
  onClose: () => void;
}

export function FittingHeader({ onClose }: FittingHeaderProps) {
  const handleClose = () => {
    haptic('tap');
    onClose();
  };

  return (
    <motion.header
      className={cn(
        'relative flex items-center justify-between px-6 py-4',
        // Glassmorphism
        'bg-white/[0.02] backdrop-blur-xl',
        'border-b border-white/[0.06]'
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easings.smooth }}
    >
      {/* Logo / Title */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, ...springs.gentle }}
      >
        {/* Agent Icon with subtle glow */}
        <div className="relative">
          <motion.div
            className={cn(
              'w-10 h-10 rounded-full',
              'bg-gradient-to-br from-white/10 to-white/[0.02]',
              'border border-white/10',
              'flex items-center justify-center',
              'shadow-[0_0_20px_rgba(255,255,255,0.05)]'
            )}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.05)',
                '0 0 30px rgba(255,255,255,0.08)',
                '0 0 20px rgba(255,255,255,0.05)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles size={16} className="text-white/60" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="flex flex-col">
          <motion.span
            className="text-[11px] font-mono text-white/40 tracking-[0.15em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            피팅 에이전트
          </motion.span>
          <motion.h1
            className="text-sm font-light text-white/90 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            가상 피팅
          </motion.h1>
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.button
        onClick={handleClose}
        className={cn(
          'w-10 h-10 rounded-full',
          'flex items-center justify-center',
          // Glassmorphism button
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-white/[0.08]',
          'hover:bg-white/[0.06] hover:border-white/[0.12]',
          'active:scale-95',
          'transition-all duration-200'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, ...springs.snappy }}
      >
        <X size={18} className="text-white/50" />
      </motion.button>

      {/* Subtle bottom gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: easings.smooth }}
      />
    </motion.header>
  );
}
