import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { ArrowUpRight, Sparkles, Scan, ShoppingBag, Zap, Eye, Layers } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/cn';
import { easings, springs } from '@/motion';

// =============================================
// Design Tokens & Constants
// =============================================
const HERO_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-in-a-studio-34422-large.mp4';

const FEATURES = [
  {
    id: 1,
    icon: Scan,
    title: 'AI Style Analysis',
    description: 'Upload any fashion image and our AI instantly detects every item, analyzing style, color, and aesthetic.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-in-a-studio-34422-large.mp4',
    gradient: 'from-rose-500 to-orange-400',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'Smart Matching',
    description: 'Discover perfectly matched items from thousands of products using advanced visual similarity.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4',
    gradient: 'from-violet-500 to-fuchsia-400',
  },
  {
    id: 3,
    icon: ShoppingBag,
    title: 'Virtual Try-On',
    description: 'See how items look on you before purchasing with our realistic virtual fitting technology.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-elegant-woman-in-a-white-dress-in-a-dark-studio-39882-large.mp4',
    gradient: 'from-cyan-500 to-blue-400',
  },
];

const STATS = [
  { value: '50K+', label: 'Products Analyzed' },
  { value: '98%', label: 'Match Accuracy' },
  { value: '2.5s', label: 'Avg Response' },
  { value: '4.9', label: 'User Rating' },
];

const WORKFLOW_STEPS = [
  { icon: Eye, label: 'Upload', desc: 'Share your style inspiration' },
  { icon: Scan, label: 'Analyze', desc: 'AI detects every item' },
  { icon: Sparkles, label: 'Match', desc: 'Find perfect alternatives' },
  { icon: Layers, label: 'Try-On', desc: 'See it on yourself' },
  { icon: ShoppingBag, label: 'Shop', desc: 'Complete your look' },
];

// =============================================
// SVG Filter Definitions for Distortion Effects
// =============================================
function SVGFilters() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        {/* Liquid Distortion Filter */}
        <filter id="liquid-distort" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="2"
            seed="1"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.01 0.01;0.02 0.015;0.01 0.01"
              dur="8s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Subtle Wave Filter */}
        <filter id="wave-distort" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.005"
            numOctaves="1"
            result="turbulence"
          >
            <animate
              attributeName="baseFrequency"
              values="0.005;0.008;0.005"
              dur="10s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="8" />
        </filter>

        {/* Glow Filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glass Blur */}
        <filter id="glass-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="glow"
          />
          <feComposite in="SourceGraphic" in2="glow" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

// =============================================
// Custom Hooks
// =============================================

// Hook for magnetic cursor effect
function useMagneticCursor(strength: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      x.set(deltaX);
      y.set(deltaY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, x, y]);

  return { ref, x: springX, y: springY };
}

// Hook for parallax depth effect
function useParallaxDepth(offset: number = 50) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPosition({ x: x * offset, y: y * offset });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [offset]);

  return position;
}

// Wrap function for infinite marquee
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

// =============================================
// Magnetic Button Component
// =============================================
interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

function MagneticButton({ children, onClick, className, strength = 0.4 }: MagneticButtonProps) {
  const { ref, x, y } = useMagneticCursor(strength);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="inline-block"
    >
      <motion.button
        onClick={onClick}
        className={className}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springs.snappy}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

// =============================================
// Soft Glass HUD Component
// =============================================
interface GlassHUDProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

function GlassHUD({ children, className, intensity = 'medium' }: GlassHUDProps) {
  const blurMap = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-xl',
    heavy: 'backdrop-blur-2xl',
  };

  const bgMap = {
    light: 'bg-white/[0.02]',
    medium: 'bg-white/[0.04]',
    heavy: 'bg-white/[0.08]',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border border-white/[0.08] overflow-hidden',
        blurMap[intensity],
        bgMap[intensity],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easings.smooth }}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// =============================================
// Breathing Orb Component
// =============================================
function BreathingOrb({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Outer glow rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-accent/20"
          animate={{
            scale: [1, 1.5 + i * 0.3, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 3,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Core */}
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-accent to-accent/60"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px rgba(238, 52, 74, 0.3)',
            '0 0 40px rgba(238, 52, 74, 0.5)',
            '0 0 20px rgba(238, 52, 74, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles className="absolute inset-0 m-auto w-1/3 h-1/3 text-white" />
      </motion.div>
    </div>
  );
}

// =============================================
// Cinematic Hover Card Component
// =============================================
interface CinematicCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

function CinematicCard({ children, className, glowColor = 'rgba(238, 52, 74, 0.3)' }: CinematicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXVal = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateYVal = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={cn('relative cursor-pointer', className)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      {/* Card content */}
      <div className="relative z-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

// =============================================
// Infinite Marquee Component
// =============================================
interface MarqueeProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
}

function Marquee({ children, baseVelocity = 2, className }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn('overflow-hidden whitespace-nowrap', className)}>
      <motion.div className="inline-flex gap-8" style={{ x }}>
        {[...Array(4)].map((_, i) => (
          <span key={i} className="inline-flex gap-8">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// =============================================
// Scroll Progress Indicator
// =============================================
function ScrollProgressIndicator({ progress }: { progress: MotionValue<number> }) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-pink-500 to-accent origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

// =============================================
// Morphing Section Transition
// =============================================
interface MorphingSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down';
}

function MorphingSection({ children, className, direction = 'up' }: MorphingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 100 : -100,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

// =============================================
// Parallax Layer Component
// =============================================
interface ParallaxLayerProps {
  children: React.ReactNode;
  depth: number; // 0-1, where 1 is furthest
  className?: string;
}

function ParallaxLayer({ children, depth, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100 * depth, 100 * depth]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1 - depth * 0.1, 1, 1 - depth * 0.1]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale }}
    >
      {children}
    </motion.div>
  );
}

// =============================================
// Text Reveal Animation
// =============================================
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : {}}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

// =============================================
// Character-by-Character Text Animation
// =============================================
interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
}

function AnimatedText({ text, className, staggerDelay = 0.03 }: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const words = text.split(' ');

  return (
    <div ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: (wordIndex * word.length + charIndex) * staggerDelay,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}

// =============================================
// Interactive Cursor Follower
// =============================================
function CursorFollower() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorAttr = target.closest('[data-cursor]');
      if (cursorAttr) {
        setIsHovering(true);
        setCursorText(cursorAttr.getAttribute('data-cursor') || '');
      } else {
        setIsHovering(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[1000] mix-blend-difference hidden lg:flex items-center justify-center"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full bg-white"
        animate={{
          width: isHovering ? 80 : 12,
          height: isHovering ? 80 : 12,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {cursorText && (
            <motion.span
              key={cursorText}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-black text-xs font-medium tracking-wide"
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =============================================
// Ambient Background
// =============================================
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(238, 52, 74, 0.08) 0%, transparent 70%)',
          top: '-20%',
          right: '-10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74, 157, 255, 0.06) 0%, transparent 70%)',
          bottom: '10%',
          left: '-5%',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 179, 71, 0.05) 0%, transparent 70%)',
          top: '40%',
          left: '30%',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  );
}

// =============================================
// Main Landing Page Component
// =============================================
export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleEnter = useCallback(() => {
    navigate(isAuthenticated ? '/home' : '/login');
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white selection:bg-accent selection:text-white overflow-x-hidden cursor-none lg:cursor-none"
    >
      <SVGFilters />
      <AmbientBackground />
      <CursorFollower />
      <ScrollProgressIndicator progress={smoothProgress} />

      {/* Header */}
      <Header onEnter={handleEnter} isAuthenticated={isAuthenticated} isLoaded={isLoaded} />

      {/* Hero Section */}
      <HeroSection onEnter={handleEnter} isLoaded={isLoaded} />

      {/* Stats Marquee */}
      <StatsMarquee />

      {/* Features Section */}
      <FeaturesSection
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        onEnter={handleEnter}
      />

      {/* Workflow Section */}
      <WorkflowSection />

      {/* Philosophy Section */}
      <PhilosophySection />

      {/* CTA Section */}
      <CTASection onEnter={handleEnter} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// =============================================
// Header Component
// =============================================
function Header({
  onEnter,
  isAuthenticated,
  isLoaded,
}: {
  onEnter: () => void;
  isAuthenticated: boolean;
  isLoaded: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 transition-all duration-700',
        isScrolled ? 'bg-black/60 backdrop-blur-2xl' : 'bg-transparent'
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isLoaded ? 0 : -100, opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={springs.snappy}
          data-cursor="HOME"
        >
          <BreathingOrb className="w-8 h-8" />
          <span className="text-sm font-medium tracking-[0.2em]">DRESSENSE</span>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'About'].map((item, i) => (
            <motion.button
              key={item}
              className="text-sm text-white/60 hover:text-white transition-colors duration-300 animated-underline"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              data-cursor="VIEW"
            >
              {item}
            </motion.button>
          ))}
        </nav>

        {/* CTA Button */}
        <MagneticButton
          onClick={onEnter}
          className="group relative px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-medium tracking-wide overflow-hidden cursor-pointer"
          strength={0.3}
        >
          <span className="relative z-10 flex items-center gap-2">
            {isAuthenticated ? 'Enter' : 'Get Started'}
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: '-100%', opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-black font-medium opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {isAuthenticated ? 'Enter' : 'Get Started'}
          </motion.span>
        </MagneticButton>
      </div>
    </motion.header>
  );
}

// =============================================
// Hero Section
// =============================================
function HeroSection({
  onEnter,
  isLoaded,
}: {
  onEnter: () => void;
  isLoaded: boolean;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parallax = useParallaxDepth(30);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <motion.section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      {/* Video Background with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ scale, y }}>
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* Badge with breathing animation */}
        <motion.div
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-10"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30, scale: isLoaded ? 1 : 0.9 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <GlassHUD intensity="light" className="px-5 py-2.5">
            <div className="flex items-center gap-3">
              <motion.span
                className="w-2 h-2 rounded-full bg-accent"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs tracking-[0.15em] text-white/80 uppercase">
                AI-Powered Fashion Discovery
              </span>
            </div>
          </GlassHUD>
        </motion.div>

        {/* Main Headline with Parallax */}
        <motion.div
          style={{
            x: parallax.x,
            y: parallax.y,
          }}
        >
          <div className="overflow-hidden mb-4">
            <motion.h1
              className="text-[clamp(3rem,12vw,9rem)] font-extralight leading-[0.85] tracking-[-0.02em]"
              initial={{ y: '100%' }}
              animate={{ y: isLoaded ? 0 : '100%' }}
              transition={{ delay: 0.5, duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              Your Style,
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="text-[clamp(3rem,12vw,9rem)] font-extralight leading-[0.85] tracking-[-0.02em]"
              initial={{ y: '100%' }}
              animate={{ y: isLoaded ? 0 : '100%' }}
              transition={{ delay: 0.6, duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="bg-gradient-to-r from-accent via-pink-400 to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                Reimagined
              </span>
            </motion.h1>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mt-8 mb-14 font-light leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          Upload any fashion image. Our AI analyzes your style and finds the perfect matches from thousands of products.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <MagneticButton
            onClick={onEnter}
            className="group relative px-10 py-5 bg-accent rounded-full text-base font-medium tracking-wide overflow-hidden cursor-pointer"
            strength={0.25}
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Exploring
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowUpRight size={18} />
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent via-pink-500 to-accent bg-[length:200%_100%]"
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </MagneticButton>

          <MagneticButton
            className="group px-10 py-5 border border-white/20 rounded-full text-base font-medium tracking-wide hover:bg-white/5 transition-all duration-500 cursor-pointer"
            strength={0.2}
          >
            <span className="flex items-center gap-3" data-cursor="PLAY">
              Watch Demo
              <motion.div
                className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center"
                whileHover={{ scale: 1.1, borderColor: 'rgba(255,255,255,0.8)' }}
              >
                <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1" />
              </motion.div>
            </span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">Scroll to explore</span>
        <motion.div
          className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2"
          animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/60 rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* Decorative Lines */}
      <motion.div
        className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isLoaded ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 1 }}
      />
      <motion.div
        className="absolute top-1/3 right-8 w-px h-48 bg-gradient-to-b from-transparent via-accent/20 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isLoaded ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 1 }}
      />
    </motion.section>
  );
}

// =============================================
// Stats Marquee Section
// =============================================
function StatsMarquee() {
  return (
    <section className="py-6 border-y border-white/5 bg-black/30 backdrop-blur-sm relative overflow-hidden">
      <Marquee baseVelocity={-0.5}>
        {STATS.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 px-12">
            <span className="text-3xl md:text-4xl font-extralight text-white">{stat.value}</span>
            <span className="text-xs tracking-[0.15em] text-white/40 uppercase">{stat.label}</span>
            <span className="w-1 h-1 rounded-full bg-accent/50" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

// =============================================
// Features Section
// =============================================
function FeaturesSection({
  activeFeature,
  setActiveFeature,
  onEnter,
}: {
  activeFeature: number;
  setActiveFeature: (i: number) => void;
  onEnter: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <MorphingSection className="max-w-2xl mb-20">
          <motion.span
            className="text-[10px] tracking-[0.3em] text-accent uppercase mb-6 block font-mono"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
            transition={{ duration: 0.6 }}
          >
            01 / Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] mb-6">
            <TextReveal text="Fashion Discovery," delay={0.1} />
            <span className="text-white/30">
              <TextReveal text="Powered by AI" delay={0.2} />
            </span>
          </h2>
          <motion.p
            className="text-white/40 text-lg font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Experience the future of fashion shopping with our intelligent matching system.
          </motion.p>
        </MorphingSection>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Feature Cards */}
          <div className="space-y-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -40 }}
                transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
              >
                <CinematicCard
                  className="w-full"
                  glowColor={activeFeature === i ? 'rgba(238, 52, 74, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
                >
                  <motion.div
                    className={cn(
                      'p-6 cursor-pointer transition-all duration-500',
                      activeFeature === i ? 'bg-white/[0.02]' : ''
                    )}
                    onClick={() => setActiveFeature(i)}
                    data-cursor="VIEW"
                  >
                    {/* Active indicator line */}
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent to-pink-500 rounded-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: activeFeature === i ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />

                    <div className="flex items-start gap-5">
                      {/* Icon */}
                      <motion.div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500',
                          activeFeature === i
                            ? `bg-gradient-to-br ${feature.gradient} shadow-lg`
                            : 'bg-white/5'
                        )}
                        animate={{
                          scale: activeFeature === i ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 2, repeat: activeFeature === i ? Infinity : 0 }}
                      >
                        <feature.icon
                          size={22}
                          className={activeFeature === i ? 'text-white' : 'text-white/50'}
                        />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3
                          className={cn(
                            'text-lg font-medium mb-2 transition-colors duration-300',
                            activeFeature === i ? 'text-white' : 'text-white/70'
                          )}
                        >
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <motion.div
                        animate={{
                          x: activeFeature === i ? 4 : 0,
                          y: activeFeature === i ? -4 : 0,
                          opacity: activeFeature === i ? 1 : 0.3,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowUpRight
                          size={20}
                          className={activeFeature === i ? 'text-accent' : 'text-white/20'}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                </CinematicCard>
              </motion.div>
            ))}
          </div>

          {/* Right: Feature Preview with Liquid Reveal */}
          <motion.div
            className="relative aspect-[4/5] rounded-3xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlassHUD intensity="light" className="absolute inset-0 rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                >
                  <video
                    src={FEATURES[activeFeature].video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Feature Number Badge */}
              <motion.div
                className="absolute top-6 left-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <GlassHUD intensity="medium" className="px-4 py-2">
                  <span className="text-sm font-mono tracking-wide">0{activeFeature + 1}</span>
                </GlassHUD>
              </motion.div>

              {/* Progress Indicators */}
              <div className="absolute top-6 right-6 flex gap-2">
                {FEATURES.map((_, i) => (
                  <motion.button
                    key={i}
                    className={cn(
                      'w-8 h-1 rounded-full transition-colors duration-300',
                      i === activeFeature ? 'bg-accent' : 'bg-white/20'
                    )}
                    onClick={() => setActiveFeature(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </div>

              {/* CTA Button */}
              <div className="absolute bottom-6 left-6 right-6">
                <MagneticButton
                  onClick={onEnter}
                  className="w-full py-4 bg-white/10 backdrop-blur-xl rounded-2xl text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  strength={0.15}
                >
                  <span>Try it now</span>
                  <ArrowUpRight size={16} />
                </MagneticButton>
              </div>
            </GlassHUD>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =============================================
// Workflow Section
// =============================================
function WorkflowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <MorphingSection className="text-center max-w-2xl mx-auto mb-20">
          <motion.span
            className="text-[10px] tracking-[0.3em] text-accent uppercase mb-6 block font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
          >
            02 / How it works
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extralight leading-tight mb-6">
            <TextReveal text="From Inspiration" delay={0.1} />
            <span className="text-white/30">
              <TextReveal text="to Your Wardrobe" delay={0.2} />
            </span>
          </h2>
        </MorphingSection>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 40 }}
                transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
              >
                <CinematicCard className="text-center p-6" glowColor="rgba(238, 52, 74, 0.15)">
                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: isInView ? 1 : 0 }}
                    transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
                  >
                    <GlassHUD intensity="heavy" className="px-3 py-1">
                      <span className="text-[10px] font-mono text-accent">0{i + 1}</span>
                    </GlassHUD>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/5"
                    whileHover={{
                      scale: 1.05,
                      borderColor: 'rgba(238, 52, 74, 0.3)',
                    }}
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      y: { duration: 3, repeat: Infinity, delay: i * 0.2 },
                    }}
                  >
                    <step.icon size={24} className="text-white/70" />
                  </motion.div>

                  {/* Label */}
                  <h4 className="text-sm font-medium mb-1">{step.label}</h4>
                  <p className="text-xs text-white/40">{step.desc}</p>
                </CinematicCard>

                {/* Arrow connector (desktop) */}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <motion.div
                    className="absolute top-1/2 -right-2 lg:-right-3 hidden lg:block"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -10 }}
                    transition={{ delay: i * 0.1 + 0.6 }}
                  >
                    <Zap size={16} className="text-accent/50" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================
// Philosophy Section
// =============================================
function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="py-40 px-6 md:px-12 relative overflow-hidden border-y border-white/5"
    >
      {/* Parallax Background Elements */}
      <ParallaxLayer depth={0.3} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </ParallaxLayer>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.span
          className="text-[10px] tracking-[0.3em] text-accent uppercase mb-8 block font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
        >
          03 / Our Philosophy
        </motion.span>

        <AnimatedText
          text="We believe fashion should be personal, accessible, and intelligent."
          className="text-3xl md:text-5xl lg:text-6xl font-extralight leading-[1.2] tracking-tight justify-center"
          staggerDelay={0.02}
        />

        <motion.p
          className="text-white/40 text-lg mt-10 max-w-2xl mx-auto font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          That is why we built Dressense - an AI agent that understands your unique style
          and helps you discover pieces that truly resonate with who you are.
        </motion.p>

        {/* Decorative element */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
          transition={{ delay: 1 }}
        >
          <BreathingOrb className="w-16 h-16" />
        </motion.div>
      </div>
    </section>
  );
}

// =============================================
// CTA Section
// =============================================
function CTASection({ onEnter }: { onEnter: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(238,52,74,0.15) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <MorphingSection>
          <motion.span
            className="text-[10px] tracking-[0.3em] text-accent uppercase mb-8 block font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
          >
            04 / Ready to start?
          </motion.span>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-[1.05] tracking-tight mb-6">
            <TextReveal text="AI가 찾아주는" delay={0.1} />
            <span className="text-white/30">
              <TextReveal text="당신만의 스타일" delay={0.2} />
            </span>
          </h2>

          <motion.p
            className="text-white/40 text-lg mb-14 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            지금 시작하고 당신만의 완벽한 스타일을 발견하세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <MagneticButton
              onClick={onEnter}
              className="group relative inline-flex items-center gap-4 px-12 py-6 rounded-full text-lg font-medium tracking-wide overflow-hidden cursor-pointer"
              strength={0.2}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent via-pink-500 to-accent bg-[length:200%_100%]"
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <span className="relative z-10">시작하기</span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowUpRight size={22} />
              </motion.span>
            </MagneticButton>
          </motion.div>
        </MorphingSection>
      </div>
    </section>
  );
}

// =============================================
// Footer
// =============================================
function Footer() {
  return (
    <footer className="py-16 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            data-cursor="HOME"
          >
            <BreathingOrb className="w-6 h-6" />
            <span className="text-sm font-medium tracking-[0.15em]">DRESSENSE</span>
          </motion.div>

          {/* Links */}
          <div className="flex items-center gap-10 text-sm text-white/40">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="hover:text-white transition-colors duration-300 animated-underline"
                data-cursor="VIEW"
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <span className="text-sm text-white/30 font-light">
            2025 Dressense. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

// =============================================
// CSS Keyframes (add to index.css or inline)
// =============================================
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-gradient {
    animation: gradient 4s ease infinite;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
