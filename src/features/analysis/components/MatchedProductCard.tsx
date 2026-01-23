import { ProductCard } from '@/components/ui';
import type { ProductCandidate } from '@/types/api';

interface MatchedProductCardProps {
  product: ProductCandidate & { parentLabel: string; category: string };
  animationDelay: number;
  onAddToCart: (selectedProductId: number) => void;
  onBuyNow: (selectedProductId: number) => void;
  onStartFitting: () => void;
  isProcessing?: boolean;
  isHighlighted?: boolean;
}

export function MatchedProductCard({
  product,
  animationDelay,
  onAddToCart,
  onBuyNow,
  onStartFitting,
  isProcessing,
  isHighlighted,
}: MatchedProductCardProps) {
  return (
    <ProductCard
      product={product}
      label={product.parentLabel}
      animationDelay={animationDelay}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
      onStartFitting={onStartFitting}
      isProcessing={isProcessing}
      isHighlighted={isHighlighted}
    />
  );
}
