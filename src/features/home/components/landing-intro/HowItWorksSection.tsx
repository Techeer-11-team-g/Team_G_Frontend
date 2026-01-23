import { memo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { WORKFLOW_DETAILS } from './constants';
import type { WorkflowDetail } from './types';

export const HowItWorksSection = memo(function HowItWorksSection() {
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
          {WORKFLOW_DETAILS.map((detail, index) => (
            <DesktopWorkflowCard key={detail.id} detail={detail} index={index} />
          ))}
        </div>

        {/* Mobile - Vertical Timeline */}
        <div className="md:hidden space-y-4">
          {WORKFLOW_DETAILS.map((detail, index) => (
            <MobileWorkflowCard
              key={detail.id}
              detail={detail}
              index={index}
              isLast={index === WORKFLOW_DETAILS.length - 1}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
});

const DesktopWorkflowCard = memo(function DesktopWorkflowCard({
  detail,
  index,
}: {
  detail: WorkflowDetail;
  index: number;
}) {
  const Icon = detail.icon;

  return (
    <motion.div
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
});

const MobileWorkflowCard = memo(function MobileWorkflowCard({
  detail,
  index,
  isLast,
}: {
  detail: WorkflowDetail;
  index: number;
  isLast: boolean;
}) {
  const Icon = detail.icon;

  return (
    <motion.div
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
});
