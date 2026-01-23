import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { easings } from '@/motion';
import { AgentOrb, ParticleBurst } from '@/components/agent';
import type { AgentOrbSectionProps } from './types';

interface AgentOrbSectionWithRefProps extends AgentOrbSectionProps {
  orbRef: React.Ref<HTMLDivElement>;
}

export const AgentOrbSection = memo(function AgentOrbSection({
  localAgentState,
  showParticleBurst,
  displayedText,
  isTyping,
  isLoading,
  onOrbClick,
  orbRef,
}: AgentOrbSectionWithRefProps) {
  return (
    <>
      {/* Agent Orb */}
      <motion.div
        ref={orbRef}
        className="relative mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: easings.smooth }}
      >
        <AgentOrb
          state={localAgentState}
          size="lg"
          onClick={onOrbClick}
          showPulse={localAgentState !== 'presenting'}
        />

        {/* Particle Burst on results */}
        <AnimatePresence>
          {showParticleBurst && (
            <ParticleBurst
              isActive={showParticleBurst}
              particleCount={20}
              colors={['#ffffff', '#e0e0e0', '#c0c0c0']}
              duration={0.8}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Agent Message */}
      <motion.div
        className="mb-8 max-w-md text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="whitespace-pre-line text-lg font-light tracking-wide text-white/70">
          {displayedText}
          {isTyping && (
            <motion.span
              className="ml-1 inline-block h-5 w-0.5 bg-white/50 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </p>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="mt-4 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/50"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Idle State - Hint Text */}
      <AnimatePresence>
        {localAgentState === 'idle' && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs tracking-wide text-white/30">
              아래 텍스트를 입력하거나 이미지를 업로드해주세요!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
