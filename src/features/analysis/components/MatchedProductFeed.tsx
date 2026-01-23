import { useEffect, useRef } from 'react';
import { MatchedProductCard } from './MatchedProductCard';
import type { ProductCandidate } from '@/types/api';

type ExtendedProduct = ProductCandidate & { parentLabel: string; category: string };

interface MatchedProductFeedProps {
  products: ExtendedProduct[];
  onAddToCart: (selectedProductId: number) => void;
  onBuyNow: (selectedProductId: number) => void;
  onStartFitting: (product: ProductCandidate) => void;
  processingProductId?: number | null;
  highlightedDetectedObjectId?: number | null;
}

export function MatchedProductFeed({
  products,
  onAddToCart,
  onBuyNow,
  onStartFitting,
  processingProductId,
  highlightedDetectedObjectId,
}: MatchedProductFeedProps) {
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 하이라이트된 상품으로 스크롤
  useEffect(() => {
    if (highlightedDetectedObjectId !== null && highlightedDetectedObjectId !== undefined) {
      const element = cardRefs.current.get(highlightedDetectedObjectId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedDetectedObjectId]);

  return (
    <section className="animate-in slide-in-from-bottom-20 fill-mode-both space-y-8 delay-300 duration-1000">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">
          Matched products
        </h4>
        <span className="font-mono text-[9px] opacity-30">{products.length} items found</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.map((product, index) => {
          const isHighlighted = product.detected_object_id === highlightedDetectedObjectId;
          return (
            <div
              key={index}
              ref={(el) => {
                if (el && product.detected_object_id) {
                  cardRefs.current.set(product.detected_object_id, el);
                }
              }}
            >
              <MatchedProductCard
                product={product}
                animationDelay={index * 150}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onStartFitting={() => onStartFitting(product)}
                isProcessing={processingProductId === product.product_id}
                isHighlighted={isHighlighted}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
