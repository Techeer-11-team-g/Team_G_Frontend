import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AnalysisResultResponse } from '@/types/api';
import { useChatRefinement } from '../hooks/useChatRefinement';
import { LoadingSpinner } from '@/components/ui';

interface ChatInlinePopupProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: number;
  onRefinementComplete: (newResult: AnalysisResultResponse) => void;
}

export function ChatInlinePopup({
  isOpen,
  onClose,
  analysisId,
  onRefinementComplete,
}: ChatInlinePopupProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useChatRefinement({
    analysisId,
    onRefinementSuccess: (result) => {
      onRefinementComplete(result);
      onClose();
    },
  });

  // Auto-focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue.trim();
    setInputValue('');
    await sendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputValue.trim()) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get last message for display
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className={cn(
          'fixed bottom-48 right-6 left-6 z-50',
          'max-w-sm ml-auto',
          'bg-white rounded-3xl shadow-2xl',
          'animate-in slide-in-from-bottom-5 fade-in duration-300',
          'overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <span className="text-[13px] font-bold">AI 스타일리스트</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Last message preview (if exists) */}
        {lastMessage && (
          <div className="px-5 py-3 bg-black/[0.02] border-b border-black/5">
            <p
              className={cn(
                'text-[12px] line-clamp-2',
                lastMessage.role === 'user' ? 'text-black/60' : 'text-black/80'
              )}
            >
              {lastMessage.content}
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-4 bg-black/[0.02]">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="예: 하늘색으로 바꿔줘"
              className="flex-1 px-4 py-3 bg-white rounded-2xl text-[13px] outline-none border border-black/10 focus:border-black/20 transition-colors placeholder:text-black/30"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all flex-shrink-0"
            >
              {isLoading ? (
                <LoadingSpinner className="h-4 w-4 border-white border-t-transparent" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
