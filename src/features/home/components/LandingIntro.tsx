import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Camera, Sparkles, Search, Shirt, ShoppingBag, ArrowDown, Compass, Clock, Users, TrendingUp, Heart, Bookmark } from 'lucide-react';

// =============================================
// Landing Intro - Complete Service Introduction
// Monochrome, minimal, elegant design
// Combines Hero, How It Works, and Features
// =============================================

export function LandingIntro() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}

// =============================================
// Hero Section
// =============================================
const WORKFLOW_STEPS = [
  { icon: Camera, title: 'Upload', subtitle: 'Drop your outfit' },
  { icon: Sparkles, title: 'Analyze', subtitle: 'AI detects items' },
  { icon: Search, title: 'Match', subtitle: 'Find similar' },
  { icon: Shirt, title: 'Try On', subtitle: 'Virtual fitting' },
  { icon: ShoppingBag, title: 'Shop', subtitle: 'Buy with ease' },
];

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20"
      style={{ opacity, y, scale }}
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <motion.p
          className="text-white/30 text-[10px] md:text-xs tracking-[0.5em] uppercase mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          AI-Powered Fashion Discovery
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extralight text-white tracking-tight mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="block text-white/90">Find Your</span>
          <span className="block mt-1 md:mt-2 font-light">Perfect Style</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-white/40 text-base md:text-lg font-light max-w-lg mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Upload any outfit photo. Our AI finds similar items, lets you try them on virtually, and helps you shop.
        </motion.p>

        {/* Workflow Steps - Compact Horizontal */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-1 md:gap-2 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === WORKFLOW_STEPS.length - 1;

            return (
              <motion.div
                key={step.title}
                className="flex items-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                {/* Step */}
                <motion.div
                  className="flex flex-col items-center px-2 md:px-4 py-2"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Icon size={18} className="text-white/60" strokeWidth={1.5} />
                  </div>
                  <span className="text-white/70 text-[10px] md:text-xs font-medium">{step.title}</span>
                  <span className="hidden md:block text-white/30 text-[9px]">{step.subtitle}</span>
                </motion.div>

                {/* Connector */}
                {!isLast && (
                  <div className="hidden md:block text-white/15 mx-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M6 10h8M11 6l4 4-4 4" />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <span className="text-white/20 text-[10px] tracking-widest uppercase">Scroll to learn more</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} className="text-white/20" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// =============================================
// How It Works Section
// =============================================
const WORKFLOW_DETAILS = [
  {
    id: 'upload',
    step: 1,
    icon: Camera,
    title: 'Upload Your Look',
    description: 'Drag and drop or tap to upload any fashion image. Street style, magazine, or your own outfit.',
    features: ['Drag & drop', 'Camera capture', 'Any image'],
  },
  {
    id: 'analyze',
    step: 2,
    icon: Sparkles,
    title: 'AI Analysis',
    description: 'Our AI scans the image and identifies individual clothing items with precise boundaries.',
    features: ['Multi-item detection', 'Style classification', 'Color extraction'],
  },
  {
    id: 'search',
    step: 3,
    icon: Search,
    title: 'Find Matches',
    description: 'Browse curated matches ranked by visual similarity across thousands of products.',
    features: ['Visual similarity', 'Price filtering', 'Brand variety'],
  },
  {
    id: 'tryon',
    step: 4,
    icon: Shirt,
    title: 'Virtual Try-On',
    description: 'Upload your photo and see how each item looks on you before making a decision.',
    features: ['AI fitting', 'Realistic render', 'Quick preview'],
  },
  {
    id: 'purchase',
    step: 5,
    icon: ShoppingBag,
    title: 'Shop Confidently',
    description: 'Add items to cart and checkout seamlessly. Your style journey, simplified.',
    features: ['Secure checkout', 'Size guide', 'Order tracking'],
  },
];

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6"
      style={{ opacity }}
    >
      {/* Section Header */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-white/30 text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4">
          How It Works
        </p>
        <h2 className="text-2xl md:text-4xl font-extralight text-white mb-4">
          From Photo to Purchase
        </h2>
        <p className="text-white/40 text-sm md:text-base font-light max-w-md mx-auto">
          Five simple steps powered by AI to help you discover and shop your favorite styles.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {/* Desktop - Horizontal Cards */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {WORKFLOW_DETAILS.map((detail, index) => {
            const Icon = detail.icon;

            return (
              <motion.div
                key={detail.id}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className="relative p-5 rounded-2xl h-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  whileHover={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    y: -4,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/10">
                    <span className="text-[10px] text-white/50 font-medium">{detail.step}</span>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon size={18} className="text-white/60" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-white/80 text-sm font-medium mb-2">
                    {detail.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/40 text-[11px] leading-relaxed mb-3">
                    {detail.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {detail.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 rounded-full text-[9px] text-white/40"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile - Vertical Timeline */}
        <div className="md:hidden space-y-4">
          {WORKFLOW_DETAILS.map((detail, index) => {
            const Icon = detail.icon;
            const isLast = index === WORKFLOW_DETAILS.length - 1;

            return (
              <motion.div
                key={detail.id}
                className="relative flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Left - Icon and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Icon size={18} className="text-white/60" strokeWidth={1.5} />
                  </div>
                  {!isLast && (
                    <div className="w-[1px] flex-1 min-h-[16px] bg-gradient-to-b from-white/15 to-transparent mt-2" />
                  )}
                </div>

                {/* Right - Content */}
                <div className="flex-1 pb-4">
                  <span className="text-[9px] text-white/30 tracking-wider">STEP {detail.step}</span>
                  <h3 className="text-white/80 text-sm font-medium mt-0.5 mb-1">{detail.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{detail.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// =============================================
// Features Section
// =============================================
function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-20 md:py-28 px-6"
      style={{ opacity }}
    >
      {/* Section Header */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-white/30 text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4">
          Explore More
        </p>
        <h2 className="text-2xl md:text-4xl font-extralight text-white mb-4">
          Discover & Manage
        </h2>
        <p className="text-white/40 text-sm md:text-base font-light max-w-md mx-auto">
          Browse community styles and track your fashion journey.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Feed Feature */}
        <motion.div
          className="group cursor-pointer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onClick={() => {
            const feedSection = document.querySelector('[data-section="feed"]');
            if (feedSection) {
              feedSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <motion.div
            className="relative p-6 md:p-8 rounded-2xl h-full overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            whileHover={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <Compass size={22} className="text-white/60" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-light text-white/90 mb-2">
              Style Feed
            </h3>

            {/* Description */}
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Explore outfit inspirations from the community. Discover trending styles and get inspired.
            </p>

            {/* Feature Points */}
            <div className="space-y-2">
              <FeaturePoint icon={Users} text="Community looks" />
              <FeaturePoint icon={TrendingUp} text="Weekly trends" />
              <FeaturePoint icon={Heart} text="Save favorites" />
            </div>

            {/* Arrow */}
            <motion.div
              className="absolute bottom-6 right-6 text-white/20"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* History Feature */}
        <motion.div
          className="group cursor-pointer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => {
            window.location.href = '/history';
          }}
        >
          <motion.div
            className="relative p-6 md:p-8 rounded-2xl h-full overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            whileHover={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <Clock size={22} className="text-white/60" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-light text-white/90 mb-2">
              My History
            </h3>

            {/* Description */}
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Track your style journey. View past analyses, revisit try-ons, and manage your history.
            </p>

            {/* Feature Points */}
            <div className="space-y-2">
              <FeaturePoint icon={Camera} text="Uploaded images" />
              <FeaturePoint icon={Sparkles} text="AI analyses" />
              <FeaturePoint icon={Bookmark} text="Saved try-ons" />
            </div>

            {/* Arrow */}
            <motion.div
              className="absolute bottom-6 right-6 text-white/20"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-white/25 text-xs">
          Ready to start? Scroll up and upload an image above.
        </p>
      </motion.div>
    </motion.section>
  );
}

// =============================================
// Feature Point Component
// =============================================
function FeaturePoint({ icon: Icon, text }: { icon: typeof Compass; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <Icon size={12} className="text-white/40" strokeWidth={1.5} />
      </div>
      <span className="text-white/50 text-xs">{text}</span>
    </div>
  );
}
