import { cn } from '@/utils/cn';
import type { ProductSize } from '@/types/api';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSizeId: number | null;
  onSelect: (sizeId: number, selectedProductId: number) => void;
}

export function SizeSelector({ sizes, selectedSizeId, onSelect }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isSelected = selectedSizeId === size.size_code_id;
        const isOutOfStock = size.inventory === 0;
        const isSelectable = !isOutOfStock && size.selected_product_id !== null;

        return (
          <button
            key={size.size_code_id}
            onClick={() => {
              if (isSelectable && size.selected_product_id) {
                onSelect(size.size_code_id, size.selected_product_id);
              }
            }}
            disabled={!isSelectable}
            className={cn(
              'px-4 py-2 rounded-xl text-[13px] font-bold transition-all',
              isSelected
                ? 'bg-black text-white'
                : isSelectable
                  ? 'bg-black/5 hover:bg-black/10'
                  : 'bg-black/5 text-black/30 cursor-not-allowed line-through'
            )}
          >
            {size.size_value}
          </button>
        );
      })}
    </div>
  );
}
