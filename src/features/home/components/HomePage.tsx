import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useImageInput, useAnalysisFlow } from '@/hooks';
import { AnalysisDisplay } from '@/features/analysis';
import { VirtualFittingRoom } from '@/features/tryon';
import { ChatRefinementFAB, ChatInlinePopup } from '@/features/chat-refinement';
import { useCart } from '@/features/cart';
import { ordersApi } from '@/api';
import { useUserStore } from '@/store';
import { ArrowLeft } from 'lucide-react';
import { ImageInputZone } from './ImageInputZone';
import { HistoryArchive } from './HistoryArchive';
import { AnalyzingState } from './AnalyzingState';
import type { ProductCandidate } from '@/types/api';

export function HomePage() {
  const navigate = useNavigate();

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
    reset,
  } = useAnalysisFlow();

  // Chat refinement
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Image input
  const { handleFileChange } = useImageInput({
    onImageReady: startAnalysis,
    onError: () => {}, // Error handled in useAnalysisFlow
  });

  // Cart & Buy
  const { addToCart } = useCart();
  const { user } = useUserStore();
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);

  // Virtual fitting
  const [isFittingMode, setIsFittingMode] = useState(false);
  const [selectedProductForFitting, setSelectedProductForFitting] =
    useState<ProductCandidate | null>(null);

  const handleAddToCart = async (selectedProductId: number) => {
    await addToCart(selectedProductId, 1);
  };

  const handleBuyNow = async (selectedProductId: number) => {
    if (!user?.user_id) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    setProcessingProductId(selectedProductId);
    try {
      // 1. 장바구니에 추가
      const cartItemId = await addToCart(selectedProductId, 1);

      // 2. 바로 주문 생성
      const order = await ordersApi.create({
        cart_item_ids: [cartItemId],
        user_id: user.user_id,
        payment_method: 'card',
      });

      toast.success('주문이 완료되었습니다');
      navigate(`/orders/${order.order_id}`);
    } catch (error) {
      console.error('Order failed:', error);
      toast.error('주문에 실패했습니다');
    } finally {
      setProcessingProductId(null);
    }
  };

  return (
    <>
      {/* 분석 결과 화면일 때 플로팅 뒤로가기 버튼 */}
      {image && (
        <button
          onClick={reset}
          className="fixed left-4 top-4 z-[150] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <main className="max-w-md mx-auto px-6 py-8">
        {!image ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <ImageInputZone onFileChange={handleFileChange} />

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
                onBuyNow={handleBuyNow}
                processingProductId={processingProductId}
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
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Chat Refinement FAB */}
      <ChatRefinementFAB
        onClick={() => setIsChatOpen(true)}
        isVisible={!!analysisResult && !isAnalyzing && !error}
      />

      {/* Chat Inline Popup */}
      {isChatOpen && analysisResult && currentAnalysisId && (
        <ChatInlinePopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          analysisId={currentAnalysisId}
          onRefinementComplete={updateAnalysisResult}
        />
      )}

    </>
  );
}
