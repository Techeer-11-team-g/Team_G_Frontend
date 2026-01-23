import { memo } from 'react';
import { motion } from 'framer-motion';
import type { WorkflowCardProps } from './types';

export const WorkflowCard = memo(function WorkflowCard({
  detail,
  index,
  isInView,
  isActive,
  onHover,
  onLeave,
}: WorkflowCardProps) {
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
});
