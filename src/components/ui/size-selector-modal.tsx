import { useState } from 'react';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { SizeSelector } from './size-selector';
import type { ProductCandidate, ProductSize } from '@/types/api';

interface SizeSelectorModalProps {
  product: ProductCandidate;
  onClose: () => void;
  onConfirm: (selectedProductId: number) => void;
  isLoading?: boolean;
}

export function SizeSelectorModal({
  product,
  onClose,
  onConfirm,
  isLoading = false,
}: SizeSelectorModalProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const handleSizeSelect = (sizeId: number, productId: number) => {
    setSelectedSizeId(sizeId);
    setSelectedProductId(productId);
  };

  const handleConfirm = () => {
    if (selectedProductId) {
      onConfirm(selectedProductId);
    }
  };

  const sizes = product.sizes || [];
  const isStringArray = sizes.length > 0 && typeof sizes[0] === 'string';
  const hasAvailableSizes = isStringArray
    ? sizes.length > 0
    : (sizes as ProductSize[]).some(
        (s) => s.inventory > 0 && s.selected_product_id !== null
      );

  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-4xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Product info */}
        <div className="flex gap-4 mb-6">
          {product.image && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-black/40 uppercase tracking-wider">{product.brand}</p>
            <p className="text-[14px] font-bold mt-1 truncate">{product.name}</p>
            <p className="text-[13px] font-medium mt-1">{product.price}</p>
          </div>
        </div>

        {/* Size selector */}
        <div className="mb-6">
          <p className="text-[11px] uppercase font-black tracking-widest text-black/40 mb-3">
            사이즈 선택
          </p>
          {sizes.length > 0 ? (
            isStringArray ? (
              <div className="flex flex-wrap gap-2">
                {(sizes as string[]).map((size, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSizeId(index);
                      if (product.product_id) setSelectedProductId(product.product_id);
                    }}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                      selectedSizeId === index
                        ? 'bg-black text-white'
                        : 'bg-black/5 hover:bg-black/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <SizeSelector
                sizes={sizes as ProductSize[]}
                selectedSizeId={selectedSizeId}
                onSelect={handleSizeSelect}
              />
            )
          ) : (
            <p className="text-[13px] text-black/40">사이즈 정보가 없습니다</p>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedProductId || isLoading || !hasAvailableSizes}
          className="w-full py-4 bg-black text-white rounded-2xl text-[12px] uppercase font-black tracking-widest flex items-center justify-center gap-2 disabled:bg-black/30 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <ShoppingBag size={16} />
              장바구니 담기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
