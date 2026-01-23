import { forwardRef, type ReactNode, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  isFocused?: boolean;
  isValid?: boolean;
  isInvalid?: boolean;
  error?: string;
  wrapperClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      icon,
      rightIcon,
      isFocused = false,
      isValid = false,
      isInvalid = false,
      error,
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        <div
          className={cn(
            'relative transition-all duration-300',
            isFocused && 'scale-[1.02]'
          )}
        >
          {icon && (
            <div
              className={cn(
                'absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300',
                isFocused ? 'text-black' : 'text-black/30'
              )}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-2xl border-2 bg-white py-4 text-[14px] outline-none transition-all duration-300',
              icon ? 'pl-14' : 'pl-5',
              rightIcon ? 'pr-14' : 'pr-5',
              isFocused
                ? 'border-black shadow-lg shadow-black/5'
                : isValid
                  ? 'border-green-400'
                  : isInvalid
                    ? 'border-red-300'
                    : 'border-black/10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="animate-in fade-in slide-in-from-top-1 pl-2 text-[11px] text-red-400 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
