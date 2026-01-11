import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui';
import { ArrowUp } from 'lucide-react';

interface CheckoutFooterProps {
  isProcessing: boolean;
  disabled: boolean;
  onCheckout: () => void;
}

export function CheckoutFooter({ isProcessing, disabled, onCheckout }: CheckoutFooterProps) {
  return (
    <footer className="p-6 pb-12 bg-white border-t border-black/5 z-[800]">
      <button
        onClick={onCheckout}
        disabled={isProcessing || disabled}
        className={cn(
          'w-full py-6 bg-black text-white text-[13px] uppercase font-black tracking-[0.6em] rounded-2xl shadow-2xl active:scale-95 transition-all relative overflow-hidden flex items-center justify-center gap-4',
          isProcessing && 'opacity-70'
        )}
      >
        {isProcessing ? (
          <>
            <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <ArrowUp size={18} strokeWidth={2.5} />
            <span>원터치 결제</span>
          </>
        )}
      </button>
    </footer>
  );
}
