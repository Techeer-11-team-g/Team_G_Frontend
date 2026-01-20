import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { easings, haptic } from '@/motion';

interface ImageAbsorptionProps {
  imageSrc: string | null;
  orbPosition: { x: number; y: number };
  isAbsorbing: boolean;
  onAbsorptionComplete?: () => void;
}

export function ImageAbsorption({
  imageSrc,
  orbPosition,
  isAbsorbing,
  onAbsorptionComplete,
}: ImageAbsorptionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const [showImage, setShowImage] = useState(true);

  // Generate particles when absorption starts
  useEffect(() => {
    if (isAbsorbing && imageSrc) {
      // Create particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.cos((i / 12) * Math.PI * 2) * 60,
        y: Math.sin((i / 12) * Math.PI * 2) * 80,
        delay: i * 0.03,
      }));
      setParticles(newParticles);
      setShowImage(true);

      // Trigger haptic
      haptic('select');

      // Start absorption animation
      const runAbsorption = async () => {
        // Phase 1: Shrink and move toward orb
        await controls.start({
          scale: [1, 1.05, 0.3],
          x: orbPosition.x,
          y: orbPosition.y - 200,
          borderRadius: '50%',
          filter: ['blur(0px)', 'blur(0px)', 'blur(4px)'],
          transition: {
            duration: 0.8,
            ease: easings.smooth,
            times: [0, 0.2, 1],
          },
        });

        // Hide image
        setShowImage(false);

        // Phase 2: Clear particles and complete
        setTimeout(() => {
          setParticles([]);
          haptic('success');
          onAbsorptionComplete?.();
        }, 200);
      };

      runAbsorption();
    }
  }, [isAbsorbing, imageSrc, orbPosition, controls, onAbsorptionComplete]);

  if (!imageSrc) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {/* Main image being absorbed */}
      <AnimatePresence>
        {showImage && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isAbsorbing
                ? controls
                : { scale: 1, opacity: 1, x: 0, y: 0 }
            }
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className="relative w-40 h-52 rounded-2xl overflow-hidden border-2 border-accent/50 shadow-2xl shadow-accent/20">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-accent/20"
                animate={
                  isAbsorbing
                    ? {
                        opacity: [0, 0.5, 1],
                      }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.6 }}
              />

              {/* Scan line effect */}
              {isAbsorbing && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: 0.8,
                    repeat: 1,
                    ease: 'linear',
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles flying toward orb */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-accent"
            style={{
              left: '50%',
              top: '50%',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)',
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: [particle.x, orbPosition.x],
              y: [particle.y, orbPosition.y - 200],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: particle.delay + 0.3,
              ease: easings.smooth,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Ripple effect at orb position when absorption completes */}
      {!showImage && (
        <motion.div
          className="absolute"
          style={{
            left: `calc(50% + ${orbPosition.x}px)`,
            top: `calc(50% + ${orbPosition.y - 200}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 rounded-full border-2 border-accent"
              style={{ transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{
                scale: [0, 2 + i * 0.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Hook to manage image absorption state
export function useImageAbsorption() {
  const [absorptionState, setAbsorptionState] = useState<{
    imageSrc: string | null;
    isAbsorbing: boolean;
  }>({
    imageSrc: null,
    isAbsorbing: false,
  });

  const startAbsorption = (imageSrc: string) => {
    setAbsorptionState({ imageSrc, isAbsorbing: true });
  };

  const completeAbsorption = () => {
    setAbsorptionState({ imageSrc: null, isAbsorbing: false });
  };

  const resetAbsorption = () => {
    setAbsorptionState({ imageSrc: null, isAbsorbing: false });
  };

  return {
    ...absorptionState,
    startAbsorption,
    completeAbsorption,
    resetAbsorption,
  };
}
