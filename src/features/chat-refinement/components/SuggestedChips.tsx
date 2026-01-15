import type { SuggestedPrompt } from '../types';

interface SuggestedChipsProps {
  prompts: SuggestedPrompt[];
  onSelect: (prompt: SuggestedPrompt) => void;
  isVisible: boolean;
}

export function SuggestedChips({ prompts, onSelect, isVisible }: SuggestedChipsProps) {
  if (!isVisible) return null;

  return (
    <div className="px-6 py-4 border-t border-black/5">
      <p className="text-[11px] uppercase font-black text-black/30 tracking-widest mb-3">
        빠른 검색
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt)}
            className="px-4 py-2.5 bg-black/5 rounded-full text-[13px] font-medium active:scale-95 hover:bg-black/10 transition-all"
          >
            {prompt.icon && <span className="mr-1.5">{prompt.icon}</span>}
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
