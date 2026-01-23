import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Button } from './button';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      isLoading = false,
      loadingText = '잠시만요...',
      children,
      disabled,
      className,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || isLoading}
        className={cn(
          'transition-all duration-300',
          !disabled && !isLoading && 'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20',
          (disabled || isLoading) && 'opacity-50',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>{loadingText}</span>
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
