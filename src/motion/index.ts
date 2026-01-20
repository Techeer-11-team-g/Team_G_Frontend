// =============================================
// DRESSENSE Motion System
// Award-winning interaction design
// =============================================

// Timing Functions (Cubic Bezier)
export const easings = {
  // Primary - smooth and premium
  smooth: [0.4, 0, 0.2, 1] as const,

  // Entrance - starts slow, ends fast
  enter: [0, 0, 0.2, 1] as const,

  // Exit - starts fast, ends slow
  exit: [0.4, 0, 1, 1] as const,

  // Bounce - playful overshoot
  bounce: [0.34, 1.56, 0.64, 1] as const,

  // Snappy - quick and responsive
  snappy: [0.16, 1, 0.3, 1] as const,

  // Emphasized - dramatic entrance
  emphasized: [0.2, 0, 0, 1] as const,
};

// Spring configurations
export const springs = {
  // Gentle - soft landing
  gentle: { type: 'spring' as const, damping: 20, stiffness: 100 },

  // Snappy - quick response
  snappy: { type: 'spring' as const, damping: 25, stiffness: 300 },

  // Bouncy - playful overshoot
  bouncy: { type: 'spring' as const, damping: 10, stiffness: 200 },

  // Stiff - minimal overshoot
  stiff: { type: 'spring' as const, damping: 30, stiffness: 400 },

  // Wobbly - organic feel
  wobbly: { type: 'spring' as const, damping: 8, stiffness: 150 },
};

// Duration Scale (seconds)
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
  stagger: 0.05,
};

// Animation Presets
export const presets = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.fast },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: durations.fast, ease: easings.bounce },
  },

  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: springs.bouncy,
  },

  slideFromRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: durations.slow, ease: easings.smooth },
  },

  slideFromBottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: durations.slow, ease: easings.smooth },
  },

  slideFromLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: durations.slow, ease: easings.smooth },
  },

  pop: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: springs.bouncy,
  },

  morph: {
    layout: true,
    transition: springs.snappy,
  },
};

// Stagger Patterns
export const stagger = {
  // Linear cascade
  cascade: (index: number) => index * durations.stagger,

  // Center outward (for grids)
  radial: (index: number, total: number) => {
    const center = Math.floor(total / 2);
    return Math.abs(index - center) * durations.stagger;
  },

  // Random organic feel
  organic: () => Math.random() * 0.15,

  // Wave pattern (for 2-column grids)
  wave: (index: number, columns = 2) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return (row + col) * durations.stagger;
  },

  // Reverse cascade
  reverse: (index: number, total: number) =>
    (total - 1 - index) * durations.stagger,
};

// Container variants for staggered children
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: durations.stagger,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Child item variants
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast },
  },
};

// Gesture feedback
export const gestureFeedback = {
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
  press: { scale: 0.95 },
};

// Orb breathing animation
export const orbBreathing = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Orb pulse animation
export const orbPulse = {
  scale: [1, 1.1, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Orb thinking animation (rotation)
export const orbThinking = {
  rotate: 360,
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Ripple animation
export const rippleAnimation = {
  scale: [1, 2],
  opacity: [0.4, 0],
  transition: {
    duration: 1,
    ease: 'easeOut',
  },
};

// Haptic feedback patterns (ms)
export const hapticPatterns = {
  tap: [10],
  success: [10, 50, 10],
  error: [50, 30, 50, 30, 50],
  select: [5],
  purchase: [10, 30, 10, 30, 100],
};

// Trigger haptic feedback
export function haptic(pattern: keyof typeof hapticPatterns) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(hapticPatterns[pattern]);
  }
}

// Utility: Check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Utility: Get motion-safe animation
export function getMotionSafe<T extends object>(
  animation: T,
  fallback?: Partial<T>
): T | Partial<T> | Record<string, unknown> {
  if (prefersReducedMotion()) {
    return fallback ?? { opacity: 1 };
  }
  return animation;
}
