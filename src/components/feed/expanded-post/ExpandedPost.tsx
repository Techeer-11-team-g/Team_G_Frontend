import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { haptic } from '@/motion';
import { useUserStore } from '@/store';
import { chatApi } from '@/api';
import { toast } from 'sonner';

import { PostHeader } from './PostHeader';
import { DetectedObjects, CategoryChips, TapHint } from './DetectedObjects';
import { ProductPanel } from './ProductPanel';
import { ChatProductPanel } from './ChatProductPanel';
import { ChatInputSection } from './ChatInput';
import {
  useKeyboardHeight,
  useImageSize,
  useChatState,
  useChatProductActions,
  useProductActions,
  truncateAgentMessage,
} from './hooks';
import type { ExpandedPostProps } from './types';
import type { ChatProduct } from '@/types/api';

export const ExpandedPost = memo(function ExpandedPost({
  item,
  isOwn,
  isActive,
  onVisibilityToggle,
  onProductPanelChange,
  user,
}: ExpandedPostProps) {
  const { userImageUrl } = useUserStore();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [selectedSizeCodeId, setSelectedSizeCodeId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Get user image URL from either store or user profile
  const effectiveUserImageUrl = userImageUrl || user?.user_image_url;

  // Custom hooks
  const keyboardHeight = useKeyboardHeight();
  const imageSize = useImageSize(imageRef, imageLoaded);

  // Chat state
  const {
    chatInput,
    setChatInput,
    agentMessage,
    setAgentMessage,
    isChatLoading,
    chatSessionId,
    setChatSessionId,
    chatProducts,
    setChatProducts,
    showChatResults,
    setShowChatResults,
    fittingImageUrl,
    setFittingImageUrl,
    handleChatSubmit,
    pollUntilComplete,
  } = useChatState(item);

  // Chat product panel state
  const [selectedChatProduct, setSelectedChatProduct] = useState<ChatProduct | null>(null);
  const [selectedChatSize, setSelectedChatSize] = useState<string | null>(null);
  const [isReSearching, setIsReSearching] = useState(false);

  // Chat product sizes - memoized
  const chatProductSizes = useMemo(
    () =>
      (selectedChatProduct?.sizes || []).map((s: unknown) =>
        typeof s === 'object' && s !== null && 'size' in s ? (s as { size: string }).size : String(s)
      ),
    [selectedChatProduct?.sizes]
  );

  // Chat product actions
  const {
    isChatAddingToCart,
    isChatPurchasing,
    isChatFitting,
    handleChatAddToCart,
    handleChatPurchase,
    handleChatFitting,
  } = useChatProductActions(
    selectedChatProduct,
    chatProductSizes,
    selectedChatSize,
    chatSessionId,
    item.analysis_id,
    pollUntilComplete,
    setAgentMessage,
    setFittingImageUrl,
    user
  );

  // Product panel state
  const objectsWithBBox = item.detected_objects?.filter((obj) => obj.bbox) || [];
  const selectedObject = item.detected_objects?.find((obj) => obj.id === selectedObjectId);
  const selectedProduct = selectedObject?.matched_product;
  const availableSizes = selectedProduct?.sizes || [];

  // Product actions
  const {
    isAddingToCart,
    isPurchasing,
    isFitting,
    handleAddToCart,
    handlePurchase,
    handleFitting,
  } = useProductActions(
    selectedProduct,
    availableSizes,
    selectedSizeCodeId,
    selectedProductId,
    effectiveUserImageUrl,
    setAgentMessage,
    setFittingImageUrl,
    setSelectedObjectId,
    user
  );

  // Handle full re-search
  const handleReSearch = useCallback(async () => {
    if (isReSearching || !item.analysis_id) return;

    setIsReSearching(true);
    setAgentMessage('전체 상품 재검색 중...');
    haptic('tap');

    try {
      let response = await chatApi.send(
        '전체 상품 다시 검색해줘',
        chatSessionId || undefined,
        item.analysis_id
      );

      setChatSessionId(response.session_id);

      if (response.response.type.includes('pending')) {
        response = await pollUntilComplete(response, setAgentMessage);
      }

      setAgentMessage(truncateAgentMessage(response.response.text));

      if (response.response.data.products && response.response.data.products.length > 0) {
        setChatProducts(response.response.data.products);
        setShowChatResults(true);
      }

      haptic('success');
    } catch (error) {
      console.error('Re-search error:', error);
      setAgentMessage('재검색에 실패했어요');
      toast.error('재검색에 실패했습니다');
      haptic('error');
    } finally {
      setIsReSearching(false);
    }
  }, [isReSearching, item.analysis_id, chatSessionId, pollUntilComplete, setAgentMessage, setChatSessionId, setChatProducts, setShowChatResults]);

  // Notify parent when product panel opens/closes
  useEffect(() => {
    onProductPanelChange(selectedObjectId !== null);
  }, [selectedObjectId, onProductPanelChange]);

  const handleBBoxClick = useCallback((e: React.MouseEvent, objectId: number) => {
    e.stopPropagation();
    haptic('tap');
    setSelectedObjectId(objectId);
    setSelectedSizeCodeId(null);
    setSelectedProductId(null);
  }, []);

  const handleVisibilityToggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);
    haptic('tap');
    try {
      await onVisibilityToggle(item.id, !item.is_public);
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, item.id, item.is_public, onVisibilityToggle]);

  const handleProductPanelClose = useCallback(() => {
    setSelectedObjectId(null);
    setSelectedSizeCodeId(null);
    setSelectedProductId(null);
  }, []);

  const handleChatProductPanelClose = useCallback(() => {
    setSelectedChatProduct(null);
    setSelectedChatSize(null);
  }, []);

  const handleChatProductAddToCart = useCallback(async () => {
    const success = await handleChatAddToCart();
    if (success) {
      setSelectedChatProduct(null);
      setSelectedChatSize(null);
    }
  }, [handleChatAddToCart]);

  const handleChatProductPurchase = useCallback(async () => {
    const success = await handleChatPurchase();
    if (success) {
      setSelectedChatProduct(null);
      setSelectedChatSize(null);
    }
  }, [handleChatPurchase]);

  const handleChatProductFitting = useCallback(async () => {
    setSelectedChatProduct(null);
    await handleChatFitting(setChatSessionId);
  }, [handleChatFitting, setChatSessionId]);

  return (
    <div className="flex h-screen w-full snap-start flex-col" style={{ touchAction: 'pan-y' }}>
      {/* Header */}
      <PostHeader
        item={item}
        isOwn={isOwn}
        isToggling={isToggling}
        onVisibilityToggle={handleVisibilityToggle}
      />

      {/* Image with BBox */}
      <div className="relative flex flex-1 flex-col items-center overflow-hidden px-4 pb-4 pt-2">
        <div className="relative max-h-full max-w-full">
          <img
            ref={imageRef}
            src={item.uploaded_image_url}
            alt="Feed item"
            className="max-h-[55vh] max-w-full rounded-2xl object-contain"
            onLoad={() => setImageLoaded(true)}
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />

          {/* BBox Overlays */}
          <DetectedObjects
            objectsWithBBox={objectsWithBBox}
            selectedObjectId={selectedObjectId}
            isActive={isActive}
            imageSize={imageSize}
            imageLoaded={imageLoaded}
            onBBoxClick={handleBBoxClick}
          />
        </div>

        {/* Category Chips */}
        <CategoryChips
          objectsWithBBox={objectsWithBBox}
          selectedObjectId={selectedObjectId}
          onBBoxClick={handleBBoxClick}
        />

        {/* Tap hint */}
        <TapHint show={!selectedObjectId && objectsWithBBox.length > 0} />
      </div>

      {/* Product Panel - Fixed at bottom */}
      {selectedObject && selectedProduct && (
        <ProductPanel
          selectedObject={selectedObject}
          selectedProduct={selectedProduct}
          availableSizes={availableSizes}
          selectedSizeCodeId={selectedSizeCodeId}
          isAddingToCart={isAddingToCart}
          isPurchasing={isPurchasing}
          isFitting={isFitting}
          onClose={handleProductPanelClose}
          onSizeSelect={(sizeCodeId, productId) => {
            setSelectedSizeCodeId(sizeCodeId);
            setSelectedProductId(productId);
          }}
          onAddToCart={handleAddToCart}
          onPurchase={handlePurchase}
          onFitting={handleFitting}
        />
      )}

      {/* No Products State */}
      {(!item.detected_objects || item.detected_objects.length === 0) && (
        <div className="p-6 text-center">
          <p className="text-sm text-white/40">감지된 아이템이 없습니다</p>
        </div>
      )}

      {/* Agent Chat Interface */}
      <ChatInputSection
        isActive={isActive}
        analysisId={item.analysis_id}
        selectedObjectId={selectedObjectId}
        chatInput={chatInput}
        agentMessage={agentMessage}
        isChatLoading={isChatLoading}
        isChatFitting={isChatFitting}
        isReSearching={isReSearching}
        showChatResults={showChatResults}
        fittingImageUrl={fittingImageUrl}
        chatProducts={chatProducts}
        keyboardHeight={keyboardHeight}
        onChatInputChange={setChatInput}
        onChatSubmit={handleChatSubmit}
        onAgentMessageDismiss={() => setAgentMessage('')}
        onFittingImageDismiss={() => setFittingImageUrl(null)}
        onChatResultsDismiss={() => setShowChatResults(false)}
        onChatProductSelect={setSelectedChatProduct}
        onReSearch={handleReSearch}
      />

      {/* Chat Product Panel */}
      {selectedChatProduct && (
        <ChatProductPanel
          selectedChatProduct={selectedChatProduct}
          chatProductSizes={chatProductSizes}
          selectedChatSize={selectedChatSize}
          isChatAddingToCart={isChatAddingToCart}
          isChatPurchasing={isChatPurchasing}
          isChatFitting={isChatFitting}
          onClose={handleChatProductPanelClose}
          onSizeSelect={setSelectedChatSize}
          onAddToCart={handleChatProductAddToCart}
          onPurchase={handleChatProductPurchase}
          onFitting={handleChatProductFitting}
        />
      )}
    </div>
  );
});
