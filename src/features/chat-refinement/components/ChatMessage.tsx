import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl',
          isUser
            ? 'bg-black text-white rounded-br-sm'
            : 'bg-black/5 text-black rounded-bl-sm',
          message.error && 'bg-red-50 text-red-600'
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2 py-1">
            <LoadingSpinner className="h-4 w-4" />
            <span className="text-[13px] text-black/50">검색 중...</span>
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
}
