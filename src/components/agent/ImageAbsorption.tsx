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
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    if (isAbsorbing && imageSrc) {
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

        // Complete
        setTimeout(() => {
          haptic('success');
          onAbsorptionComplete?.();
        }, 100);
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
            <div className="relative w-40 h-52 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl shadow-white/10">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-white/10"
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
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent"
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
