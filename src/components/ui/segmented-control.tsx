import { cn } from '@/utils/cn';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'dark' | 'light';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'dark',
}: SegmentedControlProps<T>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={cn(
        'flex p-1.5 rounded-full shadow-2xl border',
        isDark ? 'bg-black/80 backdrop-blur-md border-white/20' : 'bg-white/50 border-black/5'
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'px-8 py-3 text-[10px] uppercase font-black tracking-widest rounded-full transition-all',
            value === option
              ? isDark
                ? 'bg-white text-black'
                : 'bg-black text-white shadow-xl'
              : isDark
                ? 'text-white/40'
                : 'opacity-30 hover:opacity-50'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

