import { Send } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = '예: 하늘색으로 바꿔줘',
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="px-6 py-4 border-t border-black/5 bg-white/50 backdrop-blur-xl">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-black/5 rounded-2xl text-[14px] outline-none focus:bg-black/10 transition-colors placeholder:text-black/30"
          disabled={isLoading}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5 border-white border-t-transparent" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
