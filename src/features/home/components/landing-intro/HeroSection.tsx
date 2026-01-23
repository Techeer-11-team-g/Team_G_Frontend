import { memo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { WORKFLOW_STEPS } from './constants';

export const HeroSection = memo(function HeroSection() {
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
});
