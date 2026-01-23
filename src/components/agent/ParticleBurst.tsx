import { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springs, easings } from '@/motion';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  color: string;
}

interface ParticleBurstProps {
  isActive: boolean;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  originX?: number;
  originY?: number;
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  'rgba(139, 92, 246, 1)', // Purple
  'rgba(236, 72, 153, 1)', // Pink
  'rgba(59, 130, 246, 1)', // Blue
  'rgba(16, 185, 129, 1)', // Green
  'rgba(245, 158, 11, 1)', // Amber
];

export const ParticleBurst = memo(function ParticleBurst({
  isActive,
  particleCount = 24,
  duration = 1,
  colors = DEFAULT_COLORS,
  originX = 0,
  originY = 0,
  onComplete,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles when burst is triggered
  const generatedParticles = useMemo(() => {
    if (!isActive) return [];

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * Math.PI * 2 + Math.random() * 0.5,
      distance: 80 + Math.random() * 120,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [isActive, particleCount, colors]);

  useEffect(() => {
    if (isActive) {
      setParticles(generatedParticles);

      // Clear particles and call onComplete after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration * 1000 + 300);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isActive, generatedParticles, duration, onComplete]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: originX,
        top: originY,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = Math.sin(particle.angle) * particle.distance;

          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                left: -particle.size / 2,
                top: -particle.size / 2,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: [0, endX * 0.3, endX],
                y: [0, endY * 0.3, endY],
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration,
                delay: particle.delay,
                ease: easings.smooth,
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Central flash */}
      {isActive && (
        <motion.div
          className="absolute w-16 h-16 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            left: -32,
            top: -32,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 3], opacity: [1, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}
    </div>
  );
});

// Sparkle trail effect for product cards emerging
interface SparkleTrailProps {
  isActive: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
  onComplete?: () => void;
}

export const SparkleTrail = memo(function SparkleTrail({
  isActive,
  startX,
  startY,
  endX,
  endY,
  delay = 0,
  onComplete,
}: SparkleTrailProps) {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; progress: number; offset: number }>
  >([]);

  useEffect(() => {
    if (isActive) {
      // Generate sparkles along the path
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        progress: i / 8,
        offset: (Math.random() - 0.5) * 20,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setSparkles([]);
        onComplete?.();
      }, 800 + delay * 1000);

      return () => clearTimeout(timer);
    } else {
      setSparkles([]);
    }
  }, [isActive, delay, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {sparkles.map((sparkle) => {
          const x = startX + (endX - startX) * sparkle.progress;
          const y =
            startY +
            (endY - startY) * sparkle.progress +
            Math.sin(sparkle.progress * Math.PI) * sparkle.offset;

          return (
            <motion.div
              key={sparkle.id}
              className="absolute w-2 h-2 rounded-full bg-white/80"
              style={{
                left: x,
                top: y,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.6,
                delay: delay + sparkle.progress * 0.3,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
});

// Product card emergence animation wrapper
interface ProductEmergenceProps {
  children: React.ReactNode;
  index: number;
  originX?: number;
  originY?: number;
  isVisible: boolean;
}

export const ProductEmergence = memo(function ProductEmergence({
  children,
  index,
  originX = 0,
  originY = 0,
  isVisible,
}: ProductEmergenceProps) {
  // Calculate final position offset based on grid layout
  const columns = 2;
  const row = Math.floor(index / columns);
  const col = index % columns;
  const staggerDelay = (row + col) * 0.08;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
        x: originX,
        y: originY,
      }}
      animate={
        isVisible
          ? {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              scale: 0.5,
              x: originX,
              y: originY,
            }
      }
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2 },
      }}
      transition={{
        ...springs.bouncy,
        delay: staggerDelay,
      }}
    >
      {children}
    </motion.div>
  );
});
