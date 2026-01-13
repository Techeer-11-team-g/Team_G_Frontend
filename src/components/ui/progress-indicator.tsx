import { cn } from '@/utils/cn';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-1 rounded-full transition-colors duration-300',
            i < currentStep ? 'bg-black' : 'bg-black/10'
          )}
        />
      ))}
    </div>
  );
}
