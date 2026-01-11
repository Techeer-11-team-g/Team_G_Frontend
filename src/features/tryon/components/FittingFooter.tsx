import type { ProductCandidate } from '@/types/api';

interface FittingFooterProps {
  product: ProductCandidate;
  onAddToCart: () => void;
  onCheckout: () => void;
}

export function FittingFooter({ onAddToCart, onCheckout }: FittingFooterProps) {
  return (
    <footer className="p-6 pb-10 bg-white border-t border-black/5 grid grid-cols-2 gap-4 z-50">
      <button
        onClick={onAddToCart}
        className="py-5 border-2 border-black text-black text-[11px] uppercase font-black tracking-widest rounded-2xl active:bg-black active:text-white transition-all"
      >
        장바구니 담기
      </button>
      <button
        onClick={onCheckout}
        className="py-5 bg-black text-white text-[11px] uppercase font-black tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        Checkout
      </button>
    </footer>
  );
}

