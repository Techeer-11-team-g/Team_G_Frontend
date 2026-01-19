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
    <div className="bg-white rounded-5xl p-6 border border-black/5 shadow-sm space-y-5">
      {/* 상품 정보 */}
      <div className="flex gap-4">
        {/* 상품 이미지 */}
        {product.image && (
          <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-black/5">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 상품 정보 텍스트 */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10px] uppercase font-black text-black/30 tracking-widest">
            {product.brand}
          </p>
          <h4 className="text-[15px] font-bold leading-tight line-clamp-2">{product.name}</h4>
          <span className="inline-block text-[14px] font-mono font-bold text-black/70">
            {product.price}
          </span>
        </div>
      </div>

      {showStartButton && (
        <button
          onClick={onStartFitting}
          className="w-full py-4 bg-black text-white text-[11px] uppercase font-black tracking-[0.3em] rounded-2xl shadow-2xl active:scale-95 transition-all"
        >
          AI 착장 시작
        </button>
      )}

      {showRetryOptions && (
        <button
          onClick={onTryOther}
          className="w-full py-3 border border-black/10 rounded-2xl text-[10px] uppercase font-black tracking-widest text-black/40 active:bg-black/5"
        >
          다른 상품 시도
        </button>
      )}
    </div>
  );
}

