import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image as ImageIcon, Mic } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AgentOrb, type AgentState } from './AgentOrb';
import { AgentMessage, UserMessage, TypewriterMessage } from './AgentMessage';
import { AgentSuggestion } from './AgentSuggestion';

interface Message {
  id: string;
  type: 'agent' | 'user';
  content: string;
  image?: string;
  isTyping?: boolean;
}

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  agentState?: AgentState;
  initialMessage?: string;
  suggestions?: Array<{ id: string; label: string }>;
  onSendMessage?: (message: string, image?: File) => void;
  onSuggestionSelect?: (id: string) => void;
  messages?: Message[];
  className?: string;
}

export function AgentChat({
  isOpen,
  onClose,
  agentState = 'idle',
  initialMessage = '안녕하세요! 무엇을 도와드릴까요?',
  suggestions = [],
  onSendMessage,
  onSuggestionSelect,
  messages: externalMessages,
  className,
}: AgentChatProps) {
  const [input, setInput] = useState('');
  const [internalMessages, setInternalMessages] = useState<Message[]>([
    { id: '1', type: 'agent', content: initialMessage },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = externalMessages || internalMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (!externalMessages) {
      setInternalMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: input },
      ]);
    }

    onSendMessage?.(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage?.('', file);
    }
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 z-agent flex flex-col bg-background',
            className
          )}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <AgentOrb state={agentState} size="sm" showPulse={false} />
              <div>
                <p className="text-sm font-medium text-white">Style Agent</p>
                <p className="text-xs text-white/40">
                  {agentState === 'thinking'
                    ? '생각 중...'
                    : agentState === 'searching'
                      ? '검색 중...'
                      : '온라인'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-white/60" />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg, i) =>
              msg.type === 'agent' ? (
                msg.isTyping ? (
                  <AgentMessage key={msg.id} message="" isTyping />
                ) : i === 0 ? (
                  <TypewriterMessage
                    key={msg.id}
                    message={msg.content}
                    speed={20}
                  />
                ) : (
                  <AgentMessage
                    key={msg.id}
                    message={msg.content}
                    delay={0.1}
                  />
                )
              ) : (
                <UserMessage
                  key={msg.id}
                  message={msg.content}
                  image={msg.image}
                />
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5">
              <AgentSuggestion
                suggestions={suggestions}
                onSelect={(id) => onSuggestionSelect?.(id)}
              />
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/5 safe-bottom">
            <div className="flex items-center gap-2">
              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ImageIcon size={18} className="text-white/60" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Text input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지를 입력하세요..."
                  className={cn(
                    'w-full px-4 py-3 rounded-full',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-white/30',
                    'focus:outline-none focus:border-accent/50',
                    'transition-colors'
                  )}
                />
              </div>

              {/* Voice button */}
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <Mic size={18} className="text-white/60" />
              </button>

              {/* Send button */}
              <motion.button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-accent hover:bg-accent-hover transition-colors',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={18} className="text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
