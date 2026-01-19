import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProductCandidate, ProductSize } from '@/types/api';

interface ProductCardProps {
  product: ProductCandidate;
  label?: string;
  animationDelay?: number;
  onAddToCart?: (selectedProductId: number) => void;
  onBuyNow?: (selectedProductId: number) => void;
  onStartFitting?: () => void;
  showActions?: boolean;
  isProcessing?: boolean;
  isHighlighted?: boolean;
}

// sizes가 문자열 배열인지 ProductSize 배열인지 확인
function isStringSizeArray(sizes: ProductSize[] | string[]): sizes is string[] {
  return sizes.length > 0 && typeof sizes[0] === 'string';
}

export function ProductCard({
  product,
  label,
  animationDelay = 0,
  onAddToCart,
  onBuyNow,
  onStartFitting,
  showActions = true,
  isProcessing = false,
  isHighlighted = false,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const canExpand = showActions && (onAddToCart || onBuyNow || onStartFitting);
  const isStringSize = hasSizes && isStringSizeArray(product.sizes!);

  const handleSizeSelect = (index: number) => {
    setSelectedSizeIndex(index);
  };

  // 사이즈 선택 또는 product_id 반환
  const getProductIdForAction = () => {
    // 사이즈가 없으면 product_id 직접 사용
    if (!hasSizes && product.product_id) return product.product_id;

    // 문자열 사이즈면 product_id 사용 (사이즈 선택 필요)
    if (isStringSize && selectedSizeIndex !== null && product.product_id) {
      return product.product_id;
    }

    // ProductSize 배열이면 selected_product_id 사용
    if (!isStringSize && selectedSizeIndex !== null && product.sizes) {
      const size = product.sizes[selectedSizeIndex] as ProductSize;
      return size.selected_product_id;
    }

    return null;
  };

  const handleAddToCart = () => {
    const productId = getProductIdForAction();
    if (productId && onAddToCart) {
      onAddToCart(productId);
    }
  };

  const handleBuyNow = () => {
    const productId = getProductIdForAction();
    if (productId && onBuyNow) {
      onBuyNow(productId);
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-white p-4 shadow-sm transition-all duration-300',
        'animate-in slide-in-from-bottom-10 duration-700',
        isHighlighted
          ? 'border-accent ring-2 ring-accent/30 shadow-lg scale-[1.02]'
          : 'border-black/5'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {label && <CategoryBadge category={label} />}

      {/* 메인 영역 - 클릭하면 확장 */}
      <div
        className={cn('flex gap-4', canExpand && 'cursor-pointer')}
        onClick={() => canExpand && setIsExpanded(!isExpanded)}
      >
        {/* Product Image */}
        {product.image && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-black/5">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Product Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-black/30">
            {product.brand}
          </p>
          {product.source_url ? (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block truncate pr-8 text-[13px] font-bold tracking-tight hover:underline"
            >
              {product.name}
            </a>
          ) : (
            <h6 className="truncate pr-8 text-[13px] font-bold tracking-tight">{product.name}</h6>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] font-bold">{product.price}</span>
            {canExpand && (
              <ChevronDown
                size={14}
                className={cn('text-black/30 transition-transform', isExpanded && 'rotate-180')}
              />
            )}
          </div>
        </div>
      </div>

      {/* 확장 영역 - 사이즈 선택 & 구매 */}
      {isExpanded && canExpand && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-4 border-t border-black/5 pt-4 duration-300">
          {/* 사이즈 선택 (사이즈가 있을 때만) */}
          {hasSizes && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes!.map((size, index) => {
                  const isSelected = selectedSizeIndex === index;

                  // 문자열 사이즈
                  if (typeof size === 'string') {
                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSizeSelect(index);
                        }}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all',
                          isSelected ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10'
                        )}
                      >
                        {size}
                      </button>
                    );
                  }

                  // ProductSize 객체
                  const isOutOfStock = size.inventory === 0;
                  const isSelectable = !isOutOfStock && size.selected_product_id !== null;

                  return (
                    <button
                      key={size.size_code_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelectable) {
                          handleSizeSelect(index);
                        }
                      }}
                      disabled={!isSelectable}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all',
                        isSelected
                          ? 'bg-black text-white'
                          : isSelectable
                            ? 'bg-black/5 hover:bg-black/10'
                            : 'cursor-not-allowed bg-black/5 text-black/30 line-through'
                      )}
                    >
                      {size.size_value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={!getProductIdForAction() || isProcessing}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all',
                  getProductIdForAction() && !isProcessing
                    ? 'bg-black/10 text-black active:scale-95'
                    : 'cursor-not-allowed bg-black/5 text-black/30'
                )}
              >
                ADD to Cart
              </button>
            )}
            {onBuyNow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                disabled={!getProductIdForAction() || isProcessing}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all',
                  getProductIdForAction() && !isProcessing
                    ? 'bg-black text-white active:scale-95'
                    : 'cursor-not-allowed bg-black/20 text-white/50'
                )}
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Buy Now'}
              </button>
            )}
            {onStartFitting && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartFitting();
                }}
                className="flex-1 rounded-xl bg-accent py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
              >
                Try On
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <div className="absolute right-0 top-0 w-16 rounded-bl-2xl bg-black/5 py-1.5 text-center text-[8px] font-black uppercase tracking-widest text-black/50">
      {category}
    </div>
  );
}
