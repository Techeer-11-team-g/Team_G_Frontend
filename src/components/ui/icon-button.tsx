import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { button: 'w-9 h-9', icon: 18 },
  md: { button: 'w-12 h-12', icon: 22 },
  lg: { button: 'w-14 h-14', icon: 26 },
};

export function IconButton({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  className,
}: IconButtonProps) {
  const { button, icon } = sizeMap[size];

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full flex items-center justify-center active:scale-90 transition-all',
        variant === 'default' ? 'bg-black/5' : 'bg-black text-white shadow-xl',
        button,
        className
      )}
    >
      <Icon size={icon} strokeWidth={2} />
    </button>
  );
}

