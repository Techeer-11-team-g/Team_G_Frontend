import { cn } from '@/utils/cn';
import type { ProductCandidate } from '@/types/api';

interface FittingFooterProps {
  product: ProductCandidate;
  selectedProductId: number | null;
  onSizeSelect: (selectedProductId: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isProcessing?: boolean;
}

export function FittingFooter({
  product,
  selectedProductId,
  onSizeSelect,
  onAddToCart,
  onBuyNow,
  isProcessing,
}: FittingFooterProps) {
  const hasSizes = product.sizes && product.sizes.length > 0;
  const canPurchase = !!selectedProductId || !hasSizes;

  return (
    <footer className="p-6 pb-10 bg-white border-t border-black/5 space-y-4 z-50">
      {/* 사이즈 선택 */}
      {hasSizes && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes!.map((size, index) => {
              if (typeof size === 'string') {
                return (
                  <button
                    key={index}
                    className="px-4 py-2 bg-black/5 rounded-xl text-[12px] font-bold"
                  >
                    {size}
                  </button>
                );
              }

              const isSelected = selectedProductId === size.selected_product_id;
              const isOutOfStock = size.inventory === 0;
              const isSelectable = !isOutOfStock && size.selected_product_id !== null;

              return (
                <button
                  key={size.size_code_id}
                  onClick={() => isSelectable && onSizeSelect(size.selected_product_id)}
                  disabled={!isSelectable}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[12px] font-bold transition-all',
                    isSelected
                      ? 'bg-black text-white'
                      : isSelectable
                        ? 'bg-black/5 hover:bg-black/10'
                        : 'bg-black/5 text-black/30 line-through cursor-not-allowed'
                  )}
                >
                  {size.size_value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 구매 버튼 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAddToCart}
          disabled={!canPurchase || isProcessing}
          className={cn(
            'py-5 border-2 rounded-2xl text-[11px] uppercase font-black tracking-widest transition-all',
            canPurchase && !isProcessing
              ? 'border-black text-black active:bg-black active:text-white'
              : 'border-black/20 text-black/30 cursor-not-allowed'
          )}
        >
          장바구니
        </button>
        <button
          onClick={onBuyNow}
          disabled={!canPurchase || isProcessing}
          className={cn(
            'py-5 rounded-2xl text-[11px] uppercase font-black tracking-widest shadow-xl transition-all',
            canPurchase && !isProcessing
              ? 'bg-black text-white active:scale-95'
              : 'bg-black/30 text-white/50 cursor-not-allowed'
          )}
        >
          바로구매
        </button>
      </div>
    </footer>
  );
}

