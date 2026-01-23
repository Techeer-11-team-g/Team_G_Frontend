import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AgentOrb } from './AgentOrb';

interface AgentThinkingProps {
  status?: string;
  progress?: number;
  subTasks?: Array<{ label: string; done: boolean }>;
  className?: string;
}

export function AgentThinking({
  status = '분석 중...',
  progress,
  subTasks,
  className,
}: AgentThinkingProps) {
  return (
    <div className={cn('flex flex-col items-center gap-8', className)}>
      {/* Main Orb */}
      <AgentOrb state="thinking" size="lg" showPulse />

      {/* Status Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg text-white/90 mb-2">{status}</p>
        {progress !== undefined && (
          <p className="font-mono text-xs text-white/40">{Math.round(progress)}%</p>
        )}
      </motion.div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <motion.div
          className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* Sub Tasks */}
      {subTasks && subTasks.length > 0 && (
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subTasks.map((task, i) => (
            <motion.span
              key={i}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-mono',
                task.done
                  ? 'bg-success/20 text-success'
                  : 'bg-white/5 text-white/40'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {task.done && <span className="mr-1">✓</span>}
              {task.label}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Data Stream Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-accent/30 to-transparent rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: 0,
            }}
            animate={{
              y: [0, -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentSearchingProps {
  query?: string;
  categories?: string[];
  className?: string;
}

export function AgentSearching({
  query,
  categories,
  className,
}: AgentSearchingProps) {
  return (
    <div className={cn('flex flex-col items-center gap-8', className)}>
      {/* Main Orb */}
      <AgentOrb state="searching" size="lg" showPulse />

      {/* Status */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg text-white/90 mb-2">스타일 검색 중...</p>
        {query && (
          <p className="text-sm text-white/50">"{query}"</p>
        )}
      </motion.div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {categories.map((cat, i) => (
            <motion.span
              key={i}
              className="px-3 py-1.5 rounded-full text-xs font-mono bg-info/20 text-info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              #{cat}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
