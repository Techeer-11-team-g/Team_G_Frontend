// =============================================
// DRESSENSE Liquid Glass Design System
// Monochrome Glassmorphism + Fluid Motion
// =============================================

// Glass effect presets - Monochrome
export const glass = {
  // Subtle glass - very transparent
  subtle: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },

  // Light glass - standard
  light: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  // Medium glass - more visible
  medium: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },

  // Strong glass - prominent
  strong: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  // Frosted - more opaque
  frosted: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },

  // Dark glass - for light backgrounds
  dark: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  // Accent glass - monochrome highlight
  accent: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
};

// Gradient overlays for depth - Monochrome
export const glassGradients = {
  // Top light reflection
  reflection: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%)',

  // Bottom shadow
  shadow: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 30%)',

  // Edge highlight
  edge: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',

  // Monochrome gradient
  monochrome: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(200,200,200,0.05) 50%, rgba(150,150,150,0.05) 100%)',

  // Liquid shine
  shine: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',

  // Subtle wave
  wave: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 33%, rgba(255,255,255,0.08) 66%, rgba(255,255,255,0.04) 100%)',
};

// Box shadows for glass depth - Monochrome
export const glassShadows = {
  // Soft outer glow
  glow: '0 0 40px rgba(255, 255, 255, 0.1)',

  // Inner shadow for depth
  inner: 'inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',

  // Elevated glass
  elevated: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',

  // Subtle float
  float: '0 4px 16px rgba(0, 0, 0, 0.2)',

  // Deep
  deep: '0 16px 48px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)',

  // Ambient monochrome
  ambient: '0 8px 32px rgba(255, 255, 255, 0.05), 0 0 60px rgba(255, 255, 255, 0.03)',
};

// Tailwind class combinations - Monochrome
export const glassTw = {
  // Subtle glass panel
  subtle: 'bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] shadow-lg shadow-black/10',

  // Light glass panel
  light: 'bg-white/[0.05] backdrop-blur-md border border-white/10 shadow-lg shadow-black/20',

  // Medium glass panel
  medium: 'bg-white/[0.08] backdrop-blur-lg border border-white/[0.15] shadow-xl shadow-black/25',

  // Strong glass panel
  strong: 'bg-white/[0.12] backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30',

  // Frosted glass
  frosted: 'bg-white/[0.15] backdrop-blur-2xl border border-white/25',

  // Accent tinted glass - monochrome
  accent: 'bg-white/10 backdrop-blur-lg border border-white/20',

  // Input glass
  input: 'bg-white/[0.04] backdrop-blur-md border border-white/[0.08] focus:bg-white/[0.06] focus:border-white/[0.15]',

  // Card glass
  card: 'bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]',

  // Button glass
  button: 'bg-white/[0.06] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] hover:border-white/[0.15]',

  // Orb glass
  orb: 'bg-gradient-to-br from-white/[0.15] to-white/[0.05] backdrop-blur-xl border border-white/20',
};

// CSS-in-JS style objects - Monochrome
export const glassStyles = {
  panel: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },

  card: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.25)',
  },

  input: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
  },

  button: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  orb: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 0 60px rgba(255, 255, 255, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.05)',
  },
};

// Animation keyframes for liquid effects
export const liquidKeyframes = {
  // Morphing blob
  morph: {
    '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
    '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
  },

  // Floating
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },

  // Shimmer across surface
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },

  // Liquid wobble
  wobble: {
    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
    '25%': { transform: 'scale(1.02) rotate(1deg)' },
    '75%': { transform: 'scale(0.98) rotate(-1deg)' },
  },

  // Breathing
  breathe: {
    '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
    '50%': { transform: 'scale(1.05)', opacity: 1 },
  },

  // Pulse
  pulse: {
    '0%': { opacity: 0.4 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.4 },
  },
};

// Utility function to create glass style with custom opacity
export function createGlass(opacity: number = 0.05, blur: number = 16, borderOpacity: number = 0.1) {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
  };
}

// Utility to create gradient glass - Monochrome
export function createGradientGlass(
  fromOpacity: number = 0.08,
  toOpacity: number = 0.03,
  angle: number = 135
) {
  return {
    background: `linear-gradient(${angle}deg, rgba(255,255,255,${fromOpacity}) 0%, rgba(255,255,255,${toOpacity}) 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };
}
