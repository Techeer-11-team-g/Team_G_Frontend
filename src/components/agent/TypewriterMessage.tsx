import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TypewriterMessageProps {
  message: string;
  speed?: number; // ms per character
  variation?: number; // random variation in ms
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  cursorChar?: string;
}

export function TypewriterMessage({
  message,
  speed = 30,
  variation = 20,
  className,
  onComplete,
  showCursor = true,
  cursorChar = '|',
}: TypewriterMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const previousMessageRef = useRef('');

  useEffect(() => {
    // If message changed, reset and start typing
    if (message !== previousMessageRef.current) {
      previousMessageRef.current = message;
      setDisplayedText('');
      setIsTyping(true);
      setIsComplete(false);

      let currentIndex = 0;
      const typeNextChar = () => {
        if (currentIndex < message.length) {
          setDisplayedText(message.slice(0, currentIndex + 1));
          currentIndex++;

          // Variable typing speed for natural feel
          const nextDelay = speed + (Math.random() - 0.5) * variation;
          setTimeout(typeNextChar, nextDelay);
        } else {
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      };

      // Start typing after a brief delay
      const startDelay = setTimeout(typeNextChar, 100);
      return () => clearTimeout(startDelay);
    }
  }, [message, speed, variation, onComplete]);

  return (
    <div className={cn('relative inline-block', className)}>
      <span className="whitespace-pre-wrap">{displayedText}</span>

      {/* Blinking cursor */}
      <AnimatePresence>
        {showCursor && (isTyping || !isComplete) && (
          <motion.span
            className="inline-block text-accent ml-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {cursorChar}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// Agent message with typing animation and state
interface AgentTypingMessageProps {
  message: string;
  state?: 'idle' | 'thinking' | 'typing' | 'complete';
  className?: string;
}

export function AgentTypingMessage({
  message,
  state = 'typing',
  className,
}: AgentTypingMessageProps) {
  const [dots, setDots] = useState('');

  // Thinking dots animation
  useEffect(() => {
    if (state === 'thinking') {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 400);
      return () => clearInterval(interval);
    }
    setDots('');
  }, [state]);

  return (
    <motion.div
      className={cn(
        'text-center max-w-xs mx-auto',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {state === 'thinking' ? (
        <motion.div
          className="flex items-center justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-white/70 text-sm">생각하는 중</span>
          <span className="text-white/70 text-sm w-6 text-left">{dots}</span>
        </motion.div>
      ) : (
        <TypewriterMessage
          message={message}
          className="text-white/70 text-sm"
          showCursor={state === 'typing'}
        />
      )}
    </motion.div>
  );
}

// Streaming message effect (for longer responses)
interface StreamingMessageProps {
  chunks: string[];
  className?: string;
  chunkDelay?: number;
}

export function StreamingMessage({
  chunks,
  className,
  chunkDelay = 100,
}: StreamingMessageProps) {
  const [visibleChunks, setVisibleChunks] = useState<string[]>([]);

  useEffect(() => {
    setVisibleChunks([]);
    let index = 0;

    const showNextChunk = () => {
      if (index < chunks.length) {
        setVisibleChunks((prev) => [...prev, chunks[index]]);
        index++;
        setTimeout(showNextChunk, chunkDelay);
      }
    };

    showNextChunk();
  }, [chunks, chunkDelay]);

  return (
    <div className={className}>
      {visibleChunks.map((chunk, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {chunk}
        </motion.span>
      ))}
    </div>
  );
}

// Contextual message suggestions
interface MessageSuggestion {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

interface SuggestionsProps {
  suggestions: MessageSuggestion[];
  onSelect: (suggestion: MessageSuggestion) => void;
  className?: string;
}

export function MessageSuggestions({
  suggestions,
  onSelect,
  className,
}: SuggestionsProps) {
  return (
    <motion.div
      className={cn('flex flex-wrap gap-2 justify-center', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          className={cn(
            'px-3 py-1.5 rounded-full',
            'bg-white/5 border border-white/10',
            'text-xs text-white/60',
            'hover:bg-white/10 hover:text-white',
            'transition-colors'
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {suggestion.icon && (
            <span className="mr-1.5">{suggestion.icon}</span>
          )}
          {suggestion.text}
        </motion.button>
      ))}
    </motion.div>
  );
}
