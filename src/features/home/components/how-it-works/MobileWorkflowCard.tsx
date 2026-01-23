import { memo } from 'react';
import { motion } from 'framer-motion';
import type { MobileWorkflowCardProps } from './types';

export const MobileWorkflowCard = memo(function MobileWorkflowCard({
  detail,
  index,
  isInView,
  isLast,
}: MobileWorkflowCardProps) {
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
});
