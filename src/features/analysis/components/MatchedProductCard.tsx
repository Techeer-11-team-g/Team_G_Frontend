import { ProductCard } from '@/components/ui';
import type { ProductCandidate } from '@/types/api';

interface MatchedProductCardProps {
  product: ProductCandidate & { parentLabel: string; category: string };
  animationDelay: number;
  onAddToCart: () => void;
  onStartFitting: () => void;
}

export function MatchedProductCard({
  product,
  animationDelay,
  onAddToCart,
  onStartFitting,
}: MatchedProductCardProps) {
  return (
    <ProductCard
      product={product}
      label={product.parentLabel}
      animationDelay={animationDelay}
      onAddToCart={onAddToCart}
      onStartFitting={onStartFitting}
    />
  );
}
