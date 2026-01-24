import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';

interface FittingPreviewProps {
  userPhoto: string;
  fittingResult: string | null;
  viewMode: 'before' | 'after';
  isGenerating: boolean;
  statusMessage: string;
  onViewModeChange: (mode: 'before' | 'after') => void;
}

export function FittingPreview({
  userPhoto,
  fittingResult,
  viewMode,
  isGenerating,
  statusMessage,
  onViewModeChange,
}: FittingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(4 / 3); // default 3:4 (height/width)

  // Load user photo to get its natural dimensions
  useEffect(() => {
    if (!userPhoto) return;
    const img = new Image();
    img.onload = () => {
      // Calculate aspect ratio as height/width for paddingBottom percentage
      const ratio = (img.naturalHeight / img.naturalWidth) * 100;
      setImageAspectRatio(ratio);
    };
    img.src = userPhoto;
  }, [userPhoto]);

  // Slider drag handling
  const handleSliderDrag = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fittingResult || isGenerating) return;
    setIsDragging(true);
    handleSliderDrag(e.clientX);
    haptic('tap');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleSliderDrag(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!fittingResult || isGenerating) return;
    setIsDragging(true);
    handleSliderDrag(e.touches[0].clientX);
    haptic('tap');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleSliderDrag(e.touches[0].clientX);
  };

  // Reveal animation when result arrives
  const handleResultLoad = () => {
    haptic('success');
  };

  return (
    <div className="space-y-6">
      {/* Image Preview Container */}
      <motion.div
        ref={containerRef}
        className={cn(
          'relative w-full overflow-hidden rounded-2xl',
          // Glassmorphism container
          'bg-white/[0.02] backdrop-blur-sm',
          'border border-white/[0.06]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
          fittingResult && !isGenerating && 'cursor-ew-resize'
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: easings.smooth }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Aspect Ratio Container - adapts to user photo dimensions */}
        <div className="relative w-full" style={{ paddingBottom: `${imageAspectRatio}%` }}>
          {/* Before Image (User Photo) - Always visible */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={userPhoto}
              alt="Original"
              className={cn(
                'w-full h-full object-contain',
                isGenerating && 'blur-sm scale-[1.02]'
              )}
              style={{
                transition: 'filter 0.5s ease, transform 0.5s ease',
              }}
            />
          </motion.div>

          {/* After Image (Fitting Result) - Revealed with clip */}
          {fittingResult && !isGenerating && (
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: easings.smooth }}
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <motion.img
                src={fittingResult}
                alt="Fitting result"
                className="w-full h-full object-contain"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: easings.smooth }}
                onLoad={handleResultLoad}
              />
            </motion.div>
          )}

          {/* Generating Status Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex flex-col items-center gap-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, ...springs.gentle }}
                >
                  {/* Animated Concentric Rings */}
                  <div className="relative w-24 h-24">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          'absolute inset-0 rounded-full',
                          'border border-white/20'
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2.5,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                    ))}

                    {/* Center Spinner */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className={cn(
                          'w-12 h-12 rounded-full',
                          'border-2 border-white/10 border-t-white/60'
                        )}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>

                    {/* Inner Pulsing Core */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white/40" />
                    </motion.div>
                  </div>

                  {/* Status Text */}
                  <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-white/90 font-light tracking-wide">
                      {statusMessage}
                    </p>
                    <motion.p
                      className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing
                    </motion.p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slider Handle */}
          {fittingResult && !isGenerating && (
            <motion.div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: easings.smooth }}
            >
              {/* Slider Line */}
              <div className="absolute inset-0 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />

              {/* Slider Handle */}
              <motion.div
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                  'w-10 h-10 rounded-full',
                  // Glassmorphism handle
                  'bg-white/10 backdrop-blur-md',
                  'border border-white/30',
                  'flex items-center justify-center',
                  'shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
                  isDragging && 'scale-110'
                )}
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  boxShadow: isDragging
                    ? '0 4px 30px rgba(255,255,255,0.2)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}
                transition={springs.snappy}
              >
                {/* Handle Arrows */}
                <div className="flex items-center gap-1">
                  <div className="w-0 h-0 border-y-[4px] border-y-transparent border-r-[5px] border-r-white/60" />
                  <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[5px] border-l-white/60" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Corner Labels */}
          {fittingResult && !isGenerating && (
            <>
              <motion.div
                className={cn(
                  'absolute top-4 left-4 px-3 py-1.5 rounded-full',
                  'bg-black/40 backdrop-blur-sm',
                  'border border-white/10'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, ...springs.gentle }}
              >
                <span className="text-[10px] text-white/70 tracking-wider">
                  원본
                </span>
              </motion.div>
              <motion.div
                className={cn(
                  'absolute top-4 right-4 px-3 py-1.5 rounded-full',
                  'bg-white/10 backdrop-blur-sm',
                  'border border-white/20'
                )}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, ...springs.gentle }}
              >
                <span className="text-[10px] text-white/90 tracking-wider">
                  피팅
                </span>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Mode Toggle (fallback when slider not in use) */}
      {fittingResult && !isGenerating && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: easings.smooth }}
        >
          <div
            className={cn(
              'inline-flex p-1 rounded-full',
              // Glassmorphism toggle
              'bg-white/[0.03] backdrop-blur-sm',
              'border border-white/[0.08]'
            )}
          >
            {(['before', 'after'] as const).map((mode) => (
              <motion.button
                key={mode}
                onClick={() => {
                  haptic('select');
                  onViewModeChange(mode);
                  setSliderPosition(mode === 'before' ? 0 : 100);
                }}
                className={cn(
                  'px-6 py-2.5 rounded-full',
                  'text-[11px] tracking-wider',
                  'transition-all duration-300',
                  viewMode === mode
                    ? 'bg-white/10 text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    : 'text-white/40 hover:text-white/60'
                )}
                whileTap={{ scale: 0.95 }}
              >
                {mode === 'before' ? '원본' : '피팅'}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Drag Hint */}
      {fittingResult && !isGenerating && !isDragging && (
        <motion.p
          className="text-center text-[10px] text-white/30 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: 2 }}
        >
          드래그해서 비교하기
        </motion.p>
      )}
    </div>
  );
}
