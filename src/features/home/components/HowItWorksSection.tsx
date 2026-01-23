import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Camera, Sparkles, Search, Shirt, ShoppingBag, ArrowRight } from 'lucide-react';

// =============================================
// How It Works Section - Detailed Workflow
// Interactive demo with animated illustrations
// =============================================

interface WorkflowDetail {
  id: string;
  step: number;
  icon: typeof Camera;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

const WORKFLOW_DETAILS: WorkflowDetail[] = [
  {
    id: 'upload',
    step: 1,
    icon: Camera,
    title: 'Upload Your Look',
    subtitle: 'Start with any outfit photo',
    description: 'Drag and drop or tap to upload any fashion image. Street style, magazine, or your own outfit.',
    features: ['Drag & drop support', 'Mobile camera capture', 'Any fashion image'],
  },
  {
    id: 'analyze',
    step: 2,
    icon: Sparkles,
    title: 'AI Analysis',
    subtitle: 'Intelligent item detection',
    description: 'Our AI scans the image and identifies individual clothing items with precise boundaries.',
    features: ['Multi-item detection', 'Style classification', 'Color extraction'],
  },
  {
    id: 'search',
    step: 3,
    icon: Search,
    title: 'Find Matches',
    subtitle: 'Discover similar products',
    description: 'Browse through curated matches ranked by visual similarity across thousands of products.',
    features: ['Visual similarity search', 'Price range filtering', 'Brand diversity'],
  },
  {
    id: 'tryon',
    step: 4,
    icon: Shirt,
    title: 'Virtual Try-On',
    subtitle: 'See it on yourself',
    description: 'Upload your photo and see how each item looks on you before making a decision.',
    features: ['AI-powered fitting', 'Realistic rendering', 'Multiple angles'],
  },
  {
    id: 'purchase',
    step: 5,
    icon: ShoppingBag,
    title: 'Shop Confidently',
    subtitle: 'Complete your purchase',
    description: 'Add items to cart and checkout seamlessly. Your style journey, simplified.',
    features: ['Secure checkout', 'Size recommendations', 'Order tracking'],
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 bg-black"
    >
      {/* Section Header */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4">
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
          From Photo to Purchase
        </h2>
        <p className="text-white/50 text-base md:text-lg font-light max-w-xl mx-auto">
          Five simple steps powered by AI to help you discover and shop your favorite styles.
        </p>
      </motion.div>

      {/* Workflow Steps - Timeline */}
      <div className="max-w-5xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting Line */}
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.3 }}
            />

            {/* Steps */}
            <div className="relative grid grid-cols-5 gap-4">
              {WORKFLOW_DETAILS.map((detail, index) => (
                <WorkflowCard
                  key={detail.id}
                  detail={detail}
                  index={index}
                  isInView={isInView}
                  isActive={activeStep === detail.id}
                  onHover={() => setActiveStep(detail.id)}
                  onLeave={() => setActiveStep(null)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Vertical Timeline */}
        <div className="md:hidden space-y-6">
          {WORKFLOW_DETAILS.map((detail, index) => (
            <MobileWorkflowCard
              key={detail.id}
              detail={detail}
              index={index}
              isInView={isInView}
              isLast={index === WORKFLOW_DETAILS.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <p className="text-white/40 text-sm flex items-center justify-center gap-2">
          Ready to start?
          <ArrowRight size={14} className="text-white/40" />
          <span className="text-white/60">Scroll up and upload an image</span>
        </p>
      </motion.div>
    </section>
  );
}

// =============================================
// Desktop Workflow Card
// =============================================
function WorkflowCard({
  detail,
  index,
  isInView,
  isActive,
  onHover,
  onLeave,
}: {
  detail: WorkflowDetail;
  index: number;
  isInView: boolean;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const Icon = detail.icon;

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Icon Circle */}
      <motion.div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 cursor-pointer"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        }}
        animate={{
          scale: isActive ? 1.1 : 1,
          y: isActive ? -8 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon
          size={24}
          className={isActive ? 'text-white' : 'text-white/60'}
          strokeWidth={1.5}
        />

        {/* Step Number Badge */}
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span className="text-xs text-white/70 font-medium">{detail.step}</span>
        </div>
      </motion.div>

      {/* Title */}
      <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/70'}`}>
        {detail.title}
      </h3>

      {/* Subtitle */}
      <p className="text-[11px] text-white/40 text-center">
        {detail.subtitle}
      </p>

      {/* Expanded Details on Hover */}
      <motion.div
        className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-4 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isActive ? 'auto' : 'none' }}
      >
        <div
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-white/60 text-xs leading-relaxed mb-3">
            {detail.description}
          </p>
          <ul className="space-y-1.5">
            {detail.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-white/50 text-[10px]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================
// Mobile Workflow Card
// =============================================
function MobileWorkflowCard({
  detail,
  index,
  isInView,
  isLast,
}: {
  detail: WorkflowDetail;
  index: number;
  isInView: boolean;
  isLast: boolean;
}) {
  const Icon = detail.icon;

  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
    >
      {/* Left - Icon and Line */}
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Icon size={20} className="text-white/70" strokeWidth={1.5} />
        </div>

        {/* Connecting Line */}
        {!isLast && (
          <div className="w-[1px] flex-1 min-h-[24px] bg-gradient-to-b from-white/20 to-transparent mt-2" />
        )}
      </div>

      {/* Right - Content */}
      <div className="flex-1 pb-6">
        {/* Step Badge */}
        <span className="text-[10px] text-white/40 tracking-wider">
          STEP {detail.step}
        </span>

        {/* Title */}
        <h3 className="text-white/90 font-medium mt-1 mb-1">
          {detail.title}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed">
          {detail.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mt-3">
          {detail.features.map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 rounded-full text-[10px] text-white/50"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
