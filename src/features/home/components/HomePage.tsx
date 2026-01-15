import { useState } from 'react';
import { useImageInput, useAnalysisFlow } from '@/hooks';
import { AnalysisDisplay } from '@/features/analysis';
import { VirtualFittingRoom } from '@/features/tryon';
import { ChatRefinementFAB, ChatRefinementModal } from '@/features/chat-refinement';
import { useCartStore } from '@/store';
import { ImageInputZone } from './ImageInputZone';
import { HistoryArchive } from './HistoryArchive';
import { AnalyzingState } from './AnalyzingState';
import type { ProductCandidate } from '@/types/api';

interface HomePageProps {
  userProfilePhoto: string | null;
  onSaveUserPhoto: (photo: string) => void;
}

export function HomePage({ userProfilePhoto, onSaveUserPhoto }: HomePageProps) {
  // Analysis flow
  const {
    image,
    isAnalyzing,
    analysisResult,
    error,
    history,
    status,
    progress,
    currentAnalysisId,
    startAnalysis,
    loadFromHistory,
    updateAnalysisResult,
  } = useAnalysisFlow();

  // Chat refinement
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Image input
  const {
    inputMode,
    urlInput,
    fileInputRef,
    setInputMode,
    setUrlInput,
    handleFileChange,
    handleUrlSubmit,
    triggerFileInput,
  } = useImageInput({
    onImageReady: startAnalysis,
    onError: () => {}, // Error handled in useAnalysisFlow
  });

  // Cart
  const { addItem: addToCart } = useCartStore();

  // Virtual fitting
  const [isFittingMode, setIsFittingMode] = useState(false);
  const [selectedProductForFitting, setSelectedProductForFitting] =
    useState<ProductCandidate | null>(null);

  const handleAddToCart = (product: ProductCandidate) => {
    addToCart(product);
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
              onFileClick={triggerFileInput}
              onUrlSubmit={handleUrlSubmit}
            />

            <HistoryArchive history={history} onSelectItem={loadFromHistory} />

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
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
          userPhoto={userProfilePhoto}
          onClose={() => setIsFittingMode(false)}
          onSaveUserPhoto={onSaveUserPhoto}
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
    </>
  );
}
