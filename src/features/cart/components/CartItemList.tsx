import { CartItemCard } from './CartItemCard';
import { EmptyState } from '@/components/ui';
import type { ProductCandidate } from '@/types/api';

interface CartItemListProps {
  items: ProductCandidate[];
  excludedIndices: Set<number>;
  onToggleItem: (index: number) => void;
}

export function CartItemList({ items, excludedIndices, onToggleItem }: CartItemListProps) {
  if (items.length === 0) {
    return <EmptyState message="장바구니가 비어 있습니다" />;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <CartItemCard
          key={index}
          item={item}
          isExcluded={excludedIndices.has(index)}
          onToggle={() => onToggleItem(index)}
        />
      ))}
    </div>
  );
}
