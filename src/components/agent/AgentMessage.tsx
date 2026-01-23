import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AgentMessageProps {
  message: string;
  isTyping?: boolean;
  delay?: number;
  className?: string;
}

export function AgentMessage({
  message,
  isTyping = false,
  delay = 0,
  className,
}: AgentMessageProps) {
  return (
    <motion.div
      className={cn('flex flex-col gap-1', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3 max-w-[280px]">
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/40"
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/90 leading-relaxed">{message}</p>
        )}
      </div>
    </motion.div>
  );
}

interface TypewriterMessageProps {
  message: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterMessage({
  message,
  speed = 30,
  delay = 0,
  onComplete,
  className,
}: TypewriterMessageProps) {
  return (
    <motion.div
      className={cn('flex flex-col gap-1', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3 max-w-[280px]">
        <motion.p
          className="text-sm text-white/90 leading-relaxed"
          initial={{ opacity: 1 }}
        >
          {message.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.01,
                delay: delay + i * (speed / 1000),
              }}
              onAnimationComplete={
                i === message.length - 1 ? onComplete : undefined
              }
            >
              {char}
            </motion.span>
          ))}
          <motion.span
            className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.p>
      </div>
    </motion.div>
  );
}

interface UserMessageProps {
  message: string;
  image?: string;
  className?: string;
}

export function UserMessage({ message, image, className }: UserMessageProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-end gap-1', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
    >
      {image && (
        <div className="w-32 h-40 rounded-xl overflow-hidden mb-1">
          <img src={image} alt="User upload" className="w-full h-full object-cover" />
        </div>
      )}
      {message && (
        <div className="bg-accent rounded-2xl rounded-tr-md px-4 py-3 max-w-[280px]">
          <p className="text-sm text-white leading-relaxed">{message}</p>
        </div>
      )}
    </motion.div>
  );
}
