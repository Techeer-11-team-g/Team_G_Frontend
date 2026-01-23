import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { WORKFLOW_DETAILS } from './constants';
import { WorkflowCard } from './WorkflowCard';
import { MobileWorkflowCard } from './MobileWorkflowCard';

// =============================================
// How It Works Section - Detailed Workflow
// Interactive demo with animated illustrations
// =============================================

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
