import { X } from 'lucide-react';
import { IconButton } from '@/components/ui';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="px-6 py-6 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-xl">
      <div className="space-y-1">
        <span className="text-[9px] uppercase font-black text-black/20 tracking-widest">
          AI Stylist
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight">
          검색 수정
        </h2>
      </div>
      <IconButton icon={X} onClick={onClose} variant="default" />
    </header>
  );
}
