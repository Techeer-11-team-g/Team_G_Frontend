import { memo } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import type { AgentState } from '@/components/agent';

interface AmbientBackgroundProps {
  localAgentState: AgentState;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

export const AmbientBackground = memo(function AmbientBackground({
  localAgentState,
  springX,
  springY,
}: AmbientBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0">
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          background:
            localAgentState === 'presenting'
              ? 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          left: '50%',
          top: '40%',
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale:
            localAgentState === 'thinking' || localAgentState === 'searching' ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
});
