import { useState, useMemo } from 'react';
import { ImageWithOverlay } from './ImageWithOverlay';
import { MatchedProductFeed } from './MatchedProductFeed';
import { AnalysisError } from './AnalysisError';
import type { AnalyzedItem, ProductCandidate } from '@/types/api';

interface AnalysisDisplayProps {
  image: string;
  items: AnalyzedItem[] | null;
  error: string | null;
  onStartFitting: (product: ProductCandidate) => void;
  onAddToCart: (selectedProductId: number) => void;
  onBuyNow: (selectedProductId: number) => void;
  processingProductId?: number | null;
}

export function AnalysisDisplay({
  image,
  items,
  error,
  onStartFitting,
  onAddToCart,
  onBuyNow,
  processingProductId,
}: AnalysisDisplayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allMatches = useMemo(() => {
    if (!items) return [];
    return items.flatMap((item) =>
      item.candidates.map((c) => ({
        ...c,
        parentLabel: item.label,
        category: item.category,
      }))
    );
  }, [items]);

  // 선택된 아이템의 detected_object_id
  const highlightedDetectedObjectId = useMemo(() => {
    if (selectedIndex === null || !items) return null;
    const item = items[selectedIndex];
    // candidates의 첫 번째 상품의 detected_object_id 반환
    return item.candidates[0]?.detected_object_id ?? null;
  }, [selectedIndex, items]);

  if (error) {
    return <AnalysisError message={error} onRetry={() => window.location.reload()} />;
  }

  if (!items || !image) return null;

  return (
    <div className="relative w-full flex flex-col space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40">
      <ImageWithOverlay
        image={image}
        items={items}
        selectedIndex={selectedIndex}
        onSelectItem={setSelectedIndex}
      />

      <MatchedProductFeed
        products={allMatches}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onStartFitting={onStartFitting}
        processingProductId={processingProductId}
        highlightedDetectedObjectId={highlightedDetectedObjectId}
      />
    </div>
  );
}
