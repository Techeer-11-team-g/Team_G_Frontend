import { useState } from 'react';
import { useImageInput, useAnalysisFlow } from '@/hooks';
import { AnalysisDisplay } from '@/features/analysis';
import { VirtualFittingRoom } from '@/features/tryon';
import { ChatRefinementFAB, ChatRefinementModal } from '@/features/chat-refinement';
import { useCart } from '@/features/cart';
import { SizeSelectorModal } from '@/components/ui';
import { ImageInputZone } from './ImageInputZone';
import { HistoryArchive } from './HistoryArchive';
import { AnalyzingState } from './AnalyzingState';
import type { ProductCandidate } from '@/types/api';

export function HomePage() {
  // Analysis flow
  const {
    image,
    isAnalyzing,
    analysisResult,
    error,
    history,
    isLoadingHistory,
    hasMoreHistory,
    isFetchingMoreHistory,
    status,
    progress,
    currentAnalysisId,
    startAnalysis,
    loadFromHistory,
    updateAnalysisResult,
    fetchMoreHistory,
  } = useAnalysisFlow();

  // Chat refinement
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Image input
  const {
    inputMode,
    urlInput,
    setInputMode,
    setUrlInput,
    handleFileChange,
    handleUrlSubmit,
  } = useImageInput({
    onImageReady: startAnalysis,
    onError: () => {}, // Error handled in useAnalysisFlow
  });

  // Cart
  const { addToCart, isAdding } = useCart();
  const [productForCart, setProductForCart] = useState<ProductCandidate | null>(null);

  // Virtual fitting
  const [isFittingMode, setIsFittingMode] = useState(false);
  const [selectedProductForFitting, setSelectedProductForFitting] =
    useState<ProductCandidate | null>(null);

  const handleAddToCart = (product: ProductCandidate) => {
    setProductForCart(product);
  };

  const handleConfirmAddToCart = async (selectedProductId: number) => {
    await addToCart(selectedProductId, 1);
    setProductForCart(null);
  };

  return (
    <>
      <main className="max-w-md mx-auto px-6 py-8">
        {!image ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <ImageInputZone
              inputMode={inputMode}
              urlInput={urlInput}
              onInputModeChange={setInputMode}
              onUrlInputChange={setUrlInput}
              onUrlSubmit={handleUrlSubmit}
              onFileChange={handleFileChange}
            />

            <HistoryArchive
              history={history}
              onSelectItem={loadFromHistory}
              isLoading={isLoadingHistory}
              hasMore={hasMoreHistory}
              isFetchingMore={isFetchingMoreHistory}
              onLoadMore={fetchMoreHistory}
            />
          </div>
        ) : (
          <div className="w-full min-h-[70vh]">
            {isAnalyzing ? (
              <AnalyzingState status={status} progress={progress} />
            ) : (
              <AnalysisDisplay
                image={image}
                items={analysisResult?.items || null}
                error={error}
                onStartFitting={(p) => {
                  setSelectedProductForFitting(p);
                  setIsFittingMode(true);
                }}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        )}
      </main>

      {/* Virtual Fitting Modal */}
      {isFittingMode && selectedProductForFitting && (
        <VirtualFittingRoom
          product={selectedProductForFitting}
          onClose={() => setIsFittingMode(false)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Chat Refinement FAB */}
      <ChatRefinementFAB
        onClick={() => setIsChatOpen(true)}
        isVisible={!!analysisResult && !isAnalyzing && !error}
      />

      {/* Chat Refinement Modal */}
      {isChatOpen && analysisResult && currentAnalysisId && (
        <ChatRefinementModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          analysisId={currentAnalysisId}
          detectedObjects={analysisResult.items}
          onRefinementComplete={updateAnalysisResult}
        />
      )}

      {/* Size Selector Modal */}
      {productForCart && (
        <SizeSelectorModal
          product={productForCart}
          onClose={() => setProductForCart(null)}
          onConfirm={handleConfirmAddToCart}
          isLoading={isAdding}
        />
      )}
    </>
  );
}
