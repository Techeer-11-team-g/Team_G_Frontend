import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Camera, Sparkles, Search, Shirt, ShoppingBag } from 'lucide-react';

// =============================================
// Hero Section - Service Introduction
// Monochrome, minimalist design
// =============================================

const WORKFLOW_STEPS = [
  {
    icon: Camera,
    title: 'Upload',
    description: 'Drop your outfit photo',
    delay: 0,
  },
  {
    icon: Sparkles,
    title: 'AI Analysis',
    description: 'Our AI detects every item',
    delay: 0.1,
  },
  {
    icon: Search,
    title: 'Find Matches',
    description: 'Discover similar products',
    delay: 0.2,
  },
  {
    icon: Shirt,
    title: 'Virtual Try-On',
    description: 'See how it looks on you',
    delay: 0.3,
  },
  {
    icon: ShoppingBag,
    title: 'Purchase',
    description: 'Buy with confidence',
    delay: 0.4,
  },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{ opacity, y }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <motion.p
          className="text-white/40 text-xs tracking-[0.4em] uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          AI-Powered Fashion Discovery
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extralight text-white tracking-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="block">Find Your</span>
          <span className="block mt-2 font-normal">Perfect Style</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-white/50 text-lg md:text-xl font-light max-w-xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Upload any outfit. Our AI finds similar items, lets you try them on virtually, and helps you shop with confidence.
        </motion.p>

        {/* Workflow Steps - Horizontal */}
        <motion.div
          className="flex flex-wrap justify-center items-start gap-2 md:gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {WORKFLOW_STEPS.map((step, index) => (
            <WorkflowStep
              key={step.title}
              step={step}
              index={index}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </motion.div>

        {/* CTA hint */}
        <motion.p
          className="text-white/30 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Scroll down to start or use the input below
        </motion.p>
      </div>
    </motion.section>
  );
}

// =============================================
// Workflow Step Component
// =============================================
function WorkflowStep({
  step,
  index,
  isLast,
}: {
  step: (typeof WORKFLOW_STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + step.delay }}
    >
      {/* Step Card */}
      <motion.div
        className="flex flex-col items-center px-3 py-4 md:px-5"
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Icon Container */}
        <motion.div
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          whileHover={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <Icon size={20} className="text-white/70" strokeWidth={1.5} />

          {/* Step Number */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[10px] text-white/60 font-medium">{index + 1}</span>
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-white/80 text-xs md:text-sm font-medium mb-1">
          {step.title}
        </h3>

        {/* Description - Hidden on mobile */}
        <p className="hidden md:block text-white/40 text-[10px] text-center max-w-[80px]">
          {step.description}
        </p>
      </motion.div>

      {/* Connector Arrow */}
      {!isLast && (
        <motion.div
          className="hidden md:flex items-center text-white/20 mx-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 + step.delay }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
