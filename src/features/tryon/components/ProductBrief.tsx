import type { ProductCandidate } from '@/types/api';

interface ProductBriefProps {
  product: ProductCandidate;
  showStartButton: boolean;
  showRetryOptions: boolean;
  onStartFitting: () => void;
  onTryOther: () => void;
}

export function ProductBrief({
  product,
  showStartButton,
  showRetryOptions,
  onStartFitting,
  onTryOther,
}: ProductBriefProps) {
  return (
    <div className="bg-white rounded-5xl p-8 border border-black/5 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-accent/40 tracking-widest">
            {product.brand}
          </p>
          <h4 className="text-[18px] font-bold leading-tight">{product.name}</h4>
        </div>
        <span className="text-[15px] font-mono font-bold px-4 py-1.5 bg-black/5 rounded-full">
          {product.price}
        </span>
      </div>

      {showStartButton && (
        <button
          onClick={onStartFitting}
          className="w-full py-5 bg-black text-white text-[12px] uppercase font-black tracking-[0.4em] rounded-2xl shadow-2xl active:scale-95 transition-all"
        >
          AI 착장 시작
        </button>
      )}

      {showRetryOptions && (
        <button
          onClick={onTryOther}
          className="w-full py-4 border border-black/10 rounded-2xl text-[10px] uppercase font-black tracking-widest text-black/40 active:bg-black/5"
        >
          다른 상품 시도
        </button>
      )}
    </div>
  );
}

