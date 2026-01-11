import { useState, useMemo } from 'react';
import { ImageWithOverlay } from './ImageWithOverlay';
import { MatchedProductFeed } from './MatchedProductFeed';
import { ItemDetailModal } from './ItemDetailModal';
import { AnalysisError } from './AnalysisError';
import { BackToTopButton } from '@/components/ui';
import type { AnalyzedItem, ProductCandidate } from '@/types/api';

interface AnalysisDisplayProps {
  image: string;
  items: AnalyzedItem[] | null;
  error: string | null;
  onStartFitting: (product: ProductCandidate) => void;
  onAddToCart: (product: ProductCandidate) => void;
}

export function AnalysisDisplay({
  image,
  items,
  error,
  onStartFitting,
  onAddToCart,
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

  const currentItem = selectedIndex !== null && items ? items[selectedIndex] : null;

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
        onStartFitting={onStartFitting}
      />

      {currentItem && (
        <ItemDetailModal
          item={currentItem}
          onClose={() => setSelectedIndex(null)}
          onAddToCart={onAddToCart}
          onStartFitting={onStartFitting}
        />
      )}

      <BackToTopButton />
    </div>
  );
}
