import { MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChatRefinementFABProps {
  onClick: () => void;
  isVisible: boolean;
}

export function ChatRefinementFAB({ onClick, isVisible }: ChatRefinementFABProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-32 right-6 z-50',
        'w-14 h-14 bg-black text-white rounded-full',
        'flex items-center justify-center',
        'shadow-2xl shadow-black/30',
        'active:scale-95 transition-all',
        'animate-in fade-in scale-in duration-500'
      )}
      aria-label="AI 스타일리스트 열기"
    >
      <MessageCircle size={24} />
    </button>
  );
}
