import { memo } from 'react';
import { motion } from 'framer-motion';

export const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      <span className="text-white/40 text-sm font-medium">Loading</span>
    </motion.div>
  );
});

export const EndMessage = memo(function EndMessage() {
  return (
    <motion.p
      className="text-white/20 text-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      모든 스타일을 불러왔습니다
    </motion.p>
  );
});
