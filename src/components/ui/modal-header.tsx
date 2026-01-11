import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <header className="px-6 py-8 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-xl">
      <div className="space-y-1">
        {subtitle && (
          <span className="text-[9px] uppercase font-black text-black/20 tracking-widest">
            {subtitle}
          </span>
        )}
        <h2 className="font-serif text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center active:scale-90 transition-all"
      >
        <X size={22} strokeWidth={2} />
      </button>
    </header>
  );
}

