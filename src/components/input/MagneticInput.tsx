import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Send, Image as ImageIcon, Mic } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';

interface MagneticInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onImageClick?: () => void;
  onVoiceClick?: () => void;
  placeholder?: string;
  magneticStrength?: number;
  showImageButton?: boolean;
  showVoiceButton?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MagneticInput({
  value,
  onChange,
  onSubmit,
  onImageClick,
  onVoiceClick,
  placeholder = '무엇을 찾으시나요?',
  magneticStrength = 0.15,
  showImageButton = true,
  showVoiceButton = false,
  disabled = false,
  className,
}: MagneticInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic effect motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for magnetic pull
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Handle mouse/touch move for magnetic effect
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current || isFocused) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * magneticStrength;
      const deltaY = (e.clientY - centerY) * magneticStrength;

      mouseX.set(deltaX);
      mouseY.set(deltaY);
    },
    [magneticStrength, isFocused, mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      haptic('tap');
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Glow intensity based on interaction
  const glowOpacity = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(
        (latestX as number) ** 2 + (latestY as number) ** 2
      );
      return Math.min(0.3 + distance * 0.01, 0.5);
    }
  );

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative', className)}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{ x, y }}
    >
      {/* Monochrome glow effect */}
      <motion.div
        className="absolute -inset-3 rounded-full blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)`,
          opacity: isFocused ? 0.6 : isHovered ? glowOpacity : 0.2,
        }}
        animate={{
          scale: isFocused ? 1.1 : isHovered ? 1.05 : 1,
        }}
        transition={springs.gentle}
      />

      {/* Liquid glass container */}
      <motion.div
        className={cn(
          'relative flex items-center gap-2',
          'rounded-full overflow-hidden',
          'transition-all duration-500'
        )}
        style={{
          background: isFocused
            ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
            : isHovered
            ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isFocused
            ? '1px solid rgba(255, 255, 255, 0.3)'
            : isHovered
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isFocused
            ? `
              0 0 30px rgba(255, 255, 255, 0.1),
              inset 0 1px 2px rgba(255,255,255,0.15),
              inset 0 -1px 2px rgba(0,0,0,0.1)
            `
            : `
              0 4px 24px rgba(0,0,0,0.2),
              inset 0 1px 1px rgba(255,255,255,0.1)
            `,
        }}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={springs.snappy}
      >
        {/* Glass reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            borderRadius: 'inherit',
          }}
        />

        {/* Liquid shine animation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 'inherit' }}
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            ],
            backgroundPosition: ['-200% 0', '200% 0', '-200% 0'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Image upload button - monochrome glass style */}
        {showImageButton && (
          <motion.button
            type="button"
            onClick={() => {
              haptic('tap');
              onImageClick?.();
            }}
            className={cn(
              'ml-1.5 w-10 h-10 rounded-full relative overflow-hidden',
              'flex items-center justify-center',
              'transition-all duration-300',
              disabled && 'opacity-50 pointer-events-none'
            )}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
              boxShadow: `
                0 0 20px rgba(255, 255, 255, 0.1),
                inset 0 1px 2px rgba(255,255,255,0.3)
              `,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glass reflection on button */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
              }}
            />
            <ImageIcon size={18} className="text-white relative z-10" />
          </motion.button>
        )}

        {/* Text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 py-3.5 px-3 bg-transparent',
            'text-white text-sm placeholder:text-white/30',
            'focus:outline-none',
            'min-w-0',
            disabled && 'opacity-50'
          )}
        />

        {/* Voice button */}
        {showVoiceButton && (
          <motion.button
            type="button"
            onClick={() => {
              haptic('tap');
              onVoiceClick?.();
            }}
            className={cn(
              'w-9 h-9 rounded-full relative overflow-hidden',
              'flex items-center justify-center',
              'transition-all duration-300',
              disabled && 'opacity-50 pointer-events-none'
            )}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileHover={{
              scale: 1.1,
              background: 'rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic size={14} className="text-white/60" />
          </motion.button>
        )}

        {/* Submit button - monochrome glass style */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          className={cn(
            'mr-1.5 w-10 h-10 rounded-full relative overflow-hidden',
            'flex items-center justify-center',
            'transition-all duration-300',
            disabled && 'opacity-50 pointer-events-none'
          )}
          style={{
            background: value.trim()
              ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'
              : 'transparent',
            border: value.trim()
              ? '1px solid rgba(255,255,255,0.2)'
              : '1px solid transparent',
            boxShadow: value.trim()
              ? 'inset 0 1px 1px rgba(255,255,255,0.1)'
              : 'none',
          }}
          whileHover={value.trim() ? { scale: 1.1, background: 'rgba(255,255,255,0.2)' } : {}}
          whileTap={value.trim() ? { scale: 0.9 } : {}}
          animate={{
            opacity: value.trim() ? 1 : 0.3,
          }}
        >
          {/* Glass reflection */}
          {value.trim() && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
            />
          )}
          <Send
            size={16}
            className={cn(
              'relative z-10 transition-colors',
              value.trim() ? 'text-white' : 'text-white/30'
            )}
          />
        </motion.button>
      </motion.div>

      {/* Typing indicator - monochrome glass bubbles */}
      {isFocused && value.length > 0 && (
        <motion.div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
