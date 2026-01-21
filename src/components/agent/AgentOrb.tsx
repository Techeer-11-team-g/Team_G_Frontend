import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

export type AgentState = 'idle' | 'thinking' | 'searching' | 'presenting' | 'success' | 'error';

interface AgentOrbProps {
  state?: AgentState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showPulse?: boolean;
}

const stateConfigs = {
  idle: { baseHue: 220, saturation: 15, intensity: 0.6, pulseSpeed: 8, orbitSpeed: 0.5 },
  thinking: { baseHue: 280, saturation: 25, intensity: 0.85, pulseSpeed: 1.5, orbitSpeed: 2 },
  searching: { baseHue: 200, saturation: 20, intensity: 0.75, pulseSpeed: 2, orbitSpeed: 1.5 },
  presenting: { baseHue: 320, saturation: 30, intensity: 0.9, pulseSpeed: 3, orbitSpeed: 1 },
  success: { baseHue: 140, saturation: 25, intensity: 0.8, pulseSpeed: 4, orbitSpeed: 0.3 },
  error: { baseHue: 0, saturation: 35, intensity: 0.7, pulseSpeed: 0.5, orbitSpeed: 0 },
};

const sizeMap = {
  sm: 56,
  md: 72,
  lg: 96,
};

// Particle configuration
const PARTICLE_COUNT = 8;

interface Particle {
  id: number;
  hue: number;
  size: number;
  orbitRadius: number;
  orbitOffset: number; // Starting angle offset
  pulseOffset: number; // Phase offset for pulsing
}

export function AgentOrb({
  state = 'idle',
  size = 'md',
  className,
  onClick,
  showPulse = true,
}: AgentOrbProps) {
  const config = stateConfigs[state];
  const orbSize = sizeMap[size];

  // Ref for animation frame
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // State for particle positions
  const [particlePositions, setParticlePositions] = useState<{ x: number; y: number; scale: number; opacity: number }[]>([]);

  // Generate particles configuration (static)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      hue: (i / PARTICLE_COUNT) * 360,
      size: 4 + (i % 3),
      orbitRadius: orbSize * 0.65 + (i % 2) * 5,
      orbitOffset: (i / PARTICLE_COUNT) * Math.PI * 2,
      pulseOffset: (i / PARTICLE_COUNT) * Math.PI * 2,
    }));
  }, [orbSize]);

  // Animation loop for orbiting particles
  const animate = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const orbitSpeed = config.orbitSpeed;

    const newPositions = particles.map((particle) => {
      // Calculate current angle based on time
      const angle = particle.orbitOffset + elapsed * orbitSpeed;

      // Calculate x, y position on the orbit
      const x = Math.cos(angle) * particle.orbitRadius;
      const y = Math.sin(angle) * particle.orbitRadius;

      // Calculate pulsing scale and opacity
      const pulsePhase = elapsed * 2 + particle.pulseOffset;
      const scale = 0.8 + Math.sin(pulsePhase) * 0.4;
      const opacity = 0.5 + Math.sin(pulsePhase) * 0.5;

      return { x, y, scale, opacity };
    });

    setParticlePositions(newPositions);
    animationRef.current = requestAnimationFrame(animate);
  }, [particles, config.orbitSpeed]);

  // Start/stop animation based on state
  useEffect(() => {
    const shouldAnimate = ['idle', 'thinking', 'searching', 'presenting'].includes(state);

    if (shouldAnimate) {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, animate]);

  // Generate iridescent gradient stops
  const iridescentGradient = useMemo(() => {
    const { baseHue, saturation, intensity } = config;
    const stops = [];
    for (let i = 0; i <= 360; i += 30) {
      const hue = (baseHue + i) % 360;
      stops.push(`hsl(${hue}, ${saturation + 40}%, ${50 + intensity * 20}%)`);
    }
    return stops;
  }, [config]);

  const morphVariants = {
    idle: {
      borderRadius: [
        '42% 58% 62% 38% / 58% 42% 58% 42%',
        '58% 42% 38% 62% / 42% 58% 42% 58%',
        '45% 55% 58% 42% / 52% 48% 52% 48%',
        '42% 58% 62% 38% / 58% 42% 58% 42%',
      ],
    },
    thinking: {
      borderRadius: [
        '35% 65% 68% 32% / 32% 68% 35% 65%',
        '65% 35% 32% 68% / 68% 32% 65% 35%',
        '35% 65% 68% 32% / 32% 68% 35% 65%',
      ],
      rotate: [0, 180, 360],
    },
    searching: {
      borderRadius: [
        '50% 50% 50% 50%',
        '42% 58% 42% 58%',
        '58% 42% 58% 42%',
        '50% 50% 50% 50%',
      ],
      scale: [1, 1.08, 0.95, 1],
    },
    presenting: {
      borderRadius: '50%',
      scale: [0.92, 1.06, 1],
    },
    success: {
      borderRadius: '50%',
      scale: [1, 1.12, 1],
    },
    error: {
      borderRadius: '50%',
      scale: [1, 0.94, 1.02, 0.96, 1],
      x: [-3, 3, -2, 2, 0],
    },
  };

  const morphTransition = {
    idle: { duration: config.pulseSpeed, repeat: Infinity, ease: 'easeInOut' as const },
    thinking: { duration: config.pulseSpeed, repeat: Infinity, ease: 'linear' as const },
    searching: { duration: config.pulseSpeed, repeat: Infinity, ease: 'easeInOut' as const },
    presenting: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] as const },
    success: { duration: 0.6, ease: 'easeOut' as const },
    error: { duration: 0.5, ease: 'easeInOut' as const },
  };

  // Check if particles should be visible
  const showParticles = ['idle', 'thinking', 'searching', 'presenting'].includes(state);

  return (
    <motion.div
      className={cn('relative cursor-pointer', className)}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      style={{ width: orbSize, height: orbSize }}
    >
      {/* Outer iridescent glow layers */}
      <AnimatePresence>
        {showPulse && (
          <>
            {/* Rainbow halo - outermost */}
            <motion.div
              className="absolute rounded-full blur-2xl"
              style={{
                inset: -orbSize * 0.4,
                background: `conic-gradient(from 0deg, ${iridescentGradient.join(', ')})`,
                opacity: 0.3,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: config.pulseSpeed * 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />

            {/* Chrome reflection glow */}
            <motion.div
              className="absolute rounded-full blur-xl"
              style={{
                inset: -orbSize * 0.25,
                background: `radial-gradient(ellipse at 30% 30%,
                  rgba(255, 255, 255, 0.6) 0%,
                  rgba(200, 220, 255, 0.3) 30%,
                  transparent 70%)`,
              }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: config.pulseSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Prismatic ring pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: -4,
                background: `conic-gradient(from 180deg,
                  transparent 0deg,
                  rgba(255, 100, 200, 0.5) 60deg,
                  rgba(100, 200, 255, 0.5) 120deg,
                  rgba(200, 255, 100, 0.5) 180deg,
                  rgba(255, 200, 100, 0.5) 240deg,
                  rgba(200, 100, 255, 0.5) 300deg,
                  transparent 360deg)`,
                filter: 'blur(8px)',
              }}
              animate={{
                rotate: [0, -360],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main chrome orb container */}
      <motion.div
        className="relative w-full h-full overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.95) 0%,
              rgba(200, 210, 230, 0.9) 15%,
              rgba(120, 140, 180, 0.85) 30%,
              rgba(80, 100, 140, 0.9) 50%,
              rgba(140, 160, 200, 0.85) 70%,
              rgba(200, 220, 240, 0.9) 85%,
              rgba(255, 255, 255, 0.95) 100%
            )
          `,
          boxShadow: `
            0 0 ${orbSize * 0.5}px rgba(150, 180, 255, 0.4),
            0 0 ${orbSize * 0.25}px rgba(255, 150, 200, 0.3),
            inset 0 ${orbSize * 0.05}px ${orbSize * 0.1}px rgba(255, 255, 255, 0.8),
            inset 0 -${orbSize * 0.05}px ${orbSize * 0.1}px rgba(0, 0, 50, 0.3),
            inset ${orbSize * 0.03}px 0 ${orbSize * 0.08}px rgba(255, 200, 250, 0.3),
            inset -${orbSize * 0.03}px 0 ${orbSize * 0.08}px rgba(200, 250, 255, 0.3)
          `,
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
        variants={morphVariants}
        animate={state}
        transition={morphTransition[state]}
      >
        {/* Iridescent color overlay - animated rotation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%,
              rgba(255, 100, 150, 0.4) 0deg,
              rgba(255, 200, 100, 0.4) 45deg,
              rgba(200, 255, 100, 0.4) 90deg,
              rgba(100, 255, 200, 0.4) 135deg,
              rgba(100, 200, 255, 0.4) 180deg,
              rgba(150, 100, 255, 0.4) 225deg,
              rgba(255, 100, 200, 0.4) 270deg,
              rgba(255, 150, 150, 0.4) 315deg,
              rgba(255, 100, 150, 0.4) 360deg
            )`,
            mixBlendMode: 'overlay',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: state === 'thinking' ? 3 : 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Secondary iridescent layer - counter rotation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%,
              rgba(100, 200, 255, 0.3) 0deg,
              rgba(200, 100, 255, 0.3) 90deg,
              rgba(255, 100, 200, 0.3) 180deg,
              rgba(255, 200, 100, 0.3) 270deg,
              rgba(100, 200, 255, 0.3) 360deg
            )`,
            mixBlendMode: 'soft-light',
          }}
          animate={{ rotate: [360, 0] }}
          transition={{
            duration: state === 'thinking' ? 5 : 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Chrome highlight - top left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '5%',
            left: '10%',
            width: '45%',
            height: '35%',
            background: `
              radial-gradient(ellipse at 50% 50%,
                rgba(255, 255, 255, 0.95) 0%,
                rgba(255, 255, 255, 0.7) 20%,
                rgba(255, 255, 255, 0.3) 40%,
                transparent 70%
              )
            `,
            borderRadius: '50%',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Secondary chrome highlight */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '12%',
            left: '55%',
            width: '20%',
            height: '12%',
            background: `
              radial-gradient(ellipse at 50% 50%,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                transparent 100%
              )
            `,
            borderRadius: '50%',
            transform: 'rotate(15deg)',
          }}
        />

        {/* Moving prismatic shine */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `linear-gradient(110deg,
                transparent 20%,
                rgba(255, 150, 200, 0.3) 35%,
                rgba(150, 200, 255, 0.4) 45%,
                rgba(200, 255, 150, 0.3) 55%,
                transparent 70%)`,
              `linear-gradient(110deg,
                transparent 30%,
                rgba(200, 150, 255, 0.3) 45%,
                rgba(255, 200, 150, 0.4) 55%,
                rgba(150, 255, 200, 0.3) 65%,
                transparent 80%)`,
              `linear-gradient(110deg,
                transparent 20%,
                rgba(255, 150, 200, 0.3) 35%,
                rgba(150, 200, 255, 0.4) 45%,
                rgba(200, 255, 150, 0.3) 55%,
                transparent 70%)`,
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Depth gradient - bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '50%',
            background: `linear-gradient(to top,
              rgba(50, 60, 100, 0.4) 0%,
              rgba(80, 100, 150, 0.2) 30%,
              transparent 100%
            )`,
            borderRadius: 'inherit',
          }}
        />

        {/* Inner glow sphere */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '20%',
            left: '20%',
            width: '60%',
            height: '60%',
            background: `radial-gradient(ellipse at 40% 40%,
              rgba(255, 255, 255, 0.2) 0%,
              transparent 60%
            )`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: config.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center content based on state */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Idle - breathing prismatic core */}
          {state === 'idle' && (
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(255, 255, 255, 1) 0%,
                    rgba(200, 220, 255, 0.8) 40%,
                    rgba(150, 180, 255, 0.4) 100%
                  )`,
                  boxShadow: `
                    0 0 10px rgba(255, 255, 255, 0.8),
                    0 0 20px rgba(150, 200, 255, 0.5),
                    0 0 30px rgba(200, 150, 255, 0.3)
                  `,
                }}
                animate={{
                  boxShadow: [
                    `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(150, 200, 255, 0.5), 0 0 30px rgba(200, 150, 255, 0.3)`,
                    `0 0 15px rgba(255, 255, 255, 0.9), 0 0 25px rgba(255, 150, 200, 0.6), 0 0 35px rgba(150, 255, 200, 0.4)`,
                    `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(150, 200, 255, 0.5), 0 0 30px rgba(200, 150, 255, 0.3)`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}

          {/* Thinking - pulsing core with energy rings */}
          {state === 'thinking' && (
            <div className="relative">
              {/* Orbiting energy ring */}
              <motion.div
                className="absolute rounded-full border border-white/40"
                style={{
                  width: orbSize * 0.4,
                  height: orbSize * 0.4,
                  left: '50%',
                  top: '50%',
                  marginLeft: -orbSize * 0.2,
                  marginTop: -orbSize * 0.2,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                }}
                animate={{ scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}

          {/* Searching - pulsing core with scan effect */}
          {state === 'searching' && (
            <div className="relative">
              {/* Scan line */}
              <motion.div
                className="absolute"
                style={{
                  width: orbSize * 0.5,
                  height: 2,
                  left: '50%',
                  top: '50%',
                  marginLeft: -orbSize * 0.25,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                }}
                animate={{
                  rotate: [0, 360],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}

          {/* Success - iridescent checkmark */}
          {state === 'success' && (
            <motion.svg
              width={orbSize * 0.35}
              height={orbSize * 0.35}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <defs>
                <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(150, 255, 200, 1)" />
                  <stop offset="50%" stopColor="rgba(200, 255, 150, 1)" />
                  <stop offset="100%" stopColor="rgba(100, 255, 180, 1)" />
                </linearGradient>
              </defs>
              <motion.path
                d="M5 12l5 5L20 7"
                stroke="url(#checkGradient)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(150, 255, 200, 0.8))' }}
              />
            </motion.svg>
          )}

          {/* Error - pulsing warning */}
          {state === 'error' && (
            <motion.div
              className="font-bold"
              style={{
                fontSize: orbSize * 0.35,
                background: 'linear-gradient(135deg, rgba(255, 150, 150, 1), rgba(255, 100, 100, 1))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(255, 100, 100, 0.6))',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [1, 1.1, 1], rotate: 0 }}
              transition={{
                scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                rotate: { type: 'spring', damping: 12 },
              }}
            >
              !
            </motion.div>
          )}

          {/* Presenting - radiant sparkle */}
          {state === 'presenting' && (
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              {[0, 45, 90, 135].map((angle) => (
                <motion.div
                  key={angle}
                  className="absolute"
                  style={{
                    width: 2,
                    height: orbSize * 0.25,
                    background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.9), transparent)`,
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'top center',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scaleY: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: angle / 360,
                  }}
                />
              ))}
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(255, 255, 255, 1) 0%,
                    rgba(200, 220, 255, 0.9) 40%,
                    rgba(255, 200, 220, 0.7) 100%
                  )`,
                  boxShadow: `
                    0 0 15px rgba(255, 255, 255, 0.9),
                    0 0 30px rgba(200, 150, 255, 0.6),
                    0 0 45px rgba(150, 200, 255, 0.4)
                  `,
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </div>

        {/* Edge rim light */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(255, 255, 255, 0.4) 0%,
                transparent 30%,
                transparent 70%,
                rgba(100, 150, 200, 0.2) 100%
              )
            `,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        />
      </motion.div>

      {/* Orbiting rainbow particles - positioned with calculated x/y */}
      {showParticles && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            // Center the particle container
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {particles.map((particle, index) => {
            const position = particlePositions[index] || { x: 0, y: 0, scale: 1, opacity: 0.7 };
            return (
              <div
                key={`particle-${particle.id}`}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: `radial-gradient(circle,
                    hsla(${particle.hue}, 80%, 70%, 0.9) 0%,
                    hsla(${particle.hue}, 80%, 60%, 0.4) 100%
                  )`,
                  boxShadow: `0 0 8px hsla(${particle.hue}, 80%, 60%, 0.6)`,
                  transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
                  opacity: position.opacity,
                  transition: 'opacity 0.3s ease',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Secondary orbit layer - smaller, faster particles */}
      {showParticles && state === 'thinking' && (
        <ThinkingParticles orbSize={orbSize} />
      )}

      {/* Ambient reflection on surface below */}
      {showPulse && (
        <motion.div
          className="absolute rounded-full blur-lg"
          style={{
            bottom: -orbSize * 0.3,
            left: '10%',
            right: '10%',
            height: orbSize * 0.2,
            background: `linear-gradient(90deg,
              rgba(255, 150, 200, 0.2),
              rgba(150, 200, 255, 0.3),
              rgba(200, 255, 150, 0.2)
            )`,
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scaleX: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: config.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

// Separate component for thinking state particles (inner orbit)
function ThinkingParticles({ orbSize }: { orbSize: number }) {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const innerParticles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      hue: (i / 6) * 360 + 30, // Offset from main particles
      size: 3,
      orbitRadius: orbSize * 0.35,
      orbitOffset: (i / 6) * Math.PI * 2,
    }));
  }, [orbSize]);

  const animate = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const speed = 3; // Faster inner orbit

    const newPositions = innerParticles.map((particle) => {
      const angle = particle.orbitOffset + elapsed * speed;
      return {
        x: Math.cos(angle) * particle.orbitRadius,
        y: Math.sin(angle) * particle.orbitRadius,
      };
    });

    setPositions(newPositions);
    animationRef.current = requestAnimationFrame(animate);
  }, [innerParticles]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {innerParticles.map((particle, index) => {
        const position = positions[index] || { x: 0, y: 0 };
        return (
          <div
            key={`inner-particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              background: `hsla(${particle.hue}, 90%, 75%, 0.8)`,
              boxShadow: `0 0 6px hsla(${particle.hue}, 90%, 70%, 0.7)`,
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
