import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export type AgentState = 'idle' | 'thinking' | 'searching' | 'presenting' | 'success' | 'error';

interface AgentOrbProps {
  state?: AgentState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showPulse?: boolean;
}

// Monochrome color palettes
const stateColors = {
  idle: {
    from: 'rgba(255, 255, 255, 0.15)',
    via: 'rgba(255, 255, 255, 0.08)',
    to: 'rgba(255, 255, 255, 0.03)',
    glow: 'rgba(255, 255, 255, 0.2)',
    accent: '#FFFFFF',
  },
  thinking: {
    from: 'rgba(255, 255, 255, 0.2)',
    via: 'rgba(255, 255, 255, 0.12)',
    to: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(255, 255, 255, 0.25)',
    accent: '#FFFFFF',
  },
  searching: {
    from: 'rgba(255, 255, 255, 0.18)',
    via: 'rgba(255, 255, 255, 0.1)',
    to: 'rgba(255, 255, 255, 0.04)',
    glow: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
  },
  presenting: {
    from: 'rgba(255, 255, 255, 0.25)',
    via: 'rgba(255, 255, 255, 0.15)',
    to: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(255, 255, 255, 0.3)',
    accent: '#FFFFFF',
  },
  success: {
    from: 'rgba(255, 255, 255, 0.22)',
    via: 'rgba(255, 255, 255, 0.12)',
    to: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(255, 255, 255, 0.25)',
    accent: '#FFFFFF',
  },
  error: {
    from: 'rgba(180, 180, 180, 0.2)',
    via: 'rgba(150, 150, 150, 0.12)',
    to: 'rgba(120, 120, 120, 0.06)',
    glow: 'rgba(200, 200, 200, 0.2)',
    accent: '#CCCCCC',
  },
};

const sizeMap = {
  sm: 56,
  md: 72,
  lg: 96,
};

export function AgentOrb({
  state = 'idle',
  size = 'md',
  className,
  onClick,
  showPulse = true,
}: AgentOrbProps) {
  const colors = stateColors[state];
  const orbSize = sizeMap[size];

  // Morphing border radius for liquid effect
  const morphVariants = {
    idle: {
      borderRadius: ['40% 60% 60% 40% / 60% 40% 60% 40%', '60% 40% 40% 60% / 40% 60% 40% 60%', '40% 60% 60% 40% / 60% 40% 60% 40%'],
    },
    thinking: {
      borderRadius: ['30% 70% 70% 30% / 30% 70% 30% 70%', '70% 30% 30% 70% / 70% 30% 70% 30%', '30% 70% 70% 30% / 30% 70% 30% 70%'],
      rotate: [0, 360],
    },
    searching: {
      borderRadius: ['50% 50% 50% 50%', '40% 60% 40% 60%', '60% 40% 60% 40%', '50% 50% 50% 50%'],
      scale: [1, 1.1, 1],
    },
    presenting: {
      borderRadius: '50%',
      scale: [0.9, 1.05, 1],
    },
    success: {
      borderRadius: '50%',
      scale: [1, 1.1, 1],
    },
    error: {
      borderRadius: '50%',
      scale: [1, 0.95, 1],
      x: [-2, 2, -2, 2, 0],
    },
  };

  const morphTransition = {
    idle: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const },
    thinking: { duration: 2, repeat: Infinity, ease: 'linear' as const },
    searching: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
    presenting: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const },
    success: { duration: 0.5, ease: 'easeOut' as const },
    error: { duration: 0.4, ease: 'easeInOut' as const },
  };

  return (
    <motion.div
      className={cn('relative cursor-pointer', className)}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      style={{ width: orbSize, height: orbSize }}
    >
      {/* Ambient glow layers */}
      <AnimatePresence>
        {showPulse && (
          <>
            {/* Outer glow */}
            <motion.div
              className="absolute -inset-4 rounded-full blur-xl"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: state === 'thinking' ? 1.5 : 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              }}
            />
            {/* Inner glow ring */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              animate={{
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: `radial-gradient(circle, transparent 40%, ${colors.glow} 70%, transparent 100%)`,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main liquid glass orb */}
      <motion.div
        className="relative w-full h-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `
            0 0 40px ${colors.glow},
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1)
          `,
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        variants={morphVariants}
        animate={state}
        transition={morphTransition[state]}
      >
        {/* Glass reflection layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Liquid shine animation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.08) 50%, transparent 55%)',
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.08) 50%, transparent 55%)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Inner liquid blob */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center content based on state */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Idle - breathing dot */}
          {state === 'idle' && (
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Thinking - spinning ring */}
          {state === 'thinking' && (
            <motion.div
              className="absolute inset-3 rounded-full"
              style={{
                border: '2px solid rgba(255,255,255,0.15)',
                borderTopColor: 'rgba(255,255,255,0.8)',
              }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Searching - expanding rings */}
          {state === 'searching' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    border: '1px solid rgba(255,255,255,0.3)',
                    width: 12,
                    height: 12,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: orbSize / 12,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}

          {/* Success - checkmark */}
          {state === 'success' && (
            <motion.svg
              width={orbSize * 0.35}
              height={orbSize * 0.35}
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
            >
              <motion.path d="M5 12l5 5L20 7" />
            </motion.svg>
          )}

          {/* Error - exclamation */}
          {state === 'error' && (
            <motion.div
              className="text-white/90 font-bold"
              style={{
                fontSize: orbSize * 0.35,
                textShadow: '0 0 8px rgba(255,255,255,0.5)',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              !
            </motion.div>
          )}

          {/* Presenting - sparkle */}
          {state === 'presenting' && (
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 100%)',
                  boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Bottom edge shadow for depth */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)',
            borderRadius: 'inherit',
          }}
        />
      </motion.div>

      {/* Floating particles around orb */}
      {(state === 'thinking' || state === 'searching') && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 100%)`,
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [
                  Math.cos((i / 6) * Math.PI * 2) * (orbSize * 0.5),
                  Math.cos((i / 6 + 0.5) * Math.PI * 2) * (orbSize * 0.7),
                  Math.cos((i / 6) * Math.PI * 2) * (orbSize * 0.5),
                ],
                y: [
                  Math.sin((i / 6) * Math.PI * 2) * (orbSize * 0.5),
                  Math.sin((i / 6 + 0.5) * Math.PI * 2) * (orbSize * 0.7),
                  Math.sin((i / 6) * Math.PI * 2) * (orbSize * 0.5),
                ],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
