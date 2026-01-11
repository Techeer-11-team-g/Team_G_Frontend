import { MatchedProductCard } from './MatchedProductCard';
import type { ProductCandidate } from '@/types/api';

type ExtendedProduct = ProductCandidate & { parentLabel: string; category: string };

interface MatchedProductFeedProps {
  products: ExtendedProduct[];
  onAddToCart: (product: ProductCandidate) => void;
  onStartFitting: (product: ProductCandidate) => void;
}

export function MatchedProductFeed({
  products,
  onAddToCart,
  onStartFitting,
}: MatchedProductFeedProps) {
  return (
    <section className="space-y-8 animate-in slide-in-from-bottom-20 duration-1000 delay-300 fill-mode-both">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/20">
          Matched Artifacts Feed
        </h4>
        <span className="text-[9px] font-mono opacity-30">{products.length} items found</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.map((product, index) => (
          <MatchedProductCard
            key={index}
            product={product}
            animationDelay={index * 150}
            onAddToCart={() => onAddToCart(product)}
            onStartFitting={() => onStartFitting(product)}
          />
        ))}
      </div>
    </section>
  );
}

