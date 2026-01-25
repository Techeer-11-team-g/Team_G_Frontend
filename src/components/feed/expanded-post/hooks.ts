import { useState, useEffect, useCallback } from 'react';
import { chatApi, fittingApi, cartApi, ordersApi } from '@/api';
import { haptic } from '@/motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedItem, UserProfile, ChatProduct } from '@/types/api';
import { POLLING_INTERVAL, MAX_POLLING_ATTEMPTS } from './types';

// Helper to truncate agent message (first line only, before numbered list)
export const truncateAgentMessage = (text: string): string => {
  if (!text) return '';
  const firstLine = text.split('\n')[0];
  return firstLine.replace(/:$/, '');
};

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const newKeyboardHeight = window.innerHeight - viewport.height;
      setKeyboardHeight(Math.max(0, newKeyboardHeight));
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardHeight;
}

export function useImageSize(imageRef: React.RefObject<HTMLImageElement | null>, imageLoaded: boolean) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageRef.current || !imageLoaded) return;

    const updateImageSize = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };

    const timeoutId = setTimeout(updateImageSize, 50);
    const resizeObserver = new ResizeObserver(updateImageSize);
    resizeObserver.observe(imageRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [imageLoaded, imageRef]);

  return imageSize;
}

export function useChatPolling() {
  const pollUntilComplete = useCallback(
    async (
      initialResponse: Awaited<ReturnType<typeof chatApi.send>>,
      setAgentMessage: (msg: string) => void
    ) => {
      const { type, data } = initialResponse.response;

      let pollType: 'analysis' | 'fitting';
      let pollId: number;

      if (type === 'analysis_pending') {
        pollType = 'analysis';
        pollId = data.analysis_id!;
        setAgentMessage('분석 중...');
      } else if (type === 'fitting_pending' || type === 'batch_fitting_pending') {
        pollType = 'fitting';
        pollId = data.fitting_id || data.fitting_ids?.[0] || 0;
        setAgentMessage('가상 피팅 중...');
      } else {
        return initialResponse;
      }

      for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        try {
          const statusResponse = await chatApi.checkStatus({
            type: pollType,
            id: pollId,
            session_id: initialResponse.session_id,
          });

          if (!statusResponse.response.type.includes('pending')) {
            return statusResponse;
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }

      throw new Error('Polling timeout');
    },
    []
  );

  return { pollUntilComplete };
}

export function useChatState(item: FeedItem) {
  const [chatInput, setChatInput] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatProducts, setChatProducts] = useState<ChatProduct[]>([]);
  const [showChatResults, setShowChatResults] = useState(false);
  const [fittingImageUrl, setFittingImageUrl] = useState<string | null>(null);

  const { pollUntilComplete } = useChatPolling();

  // Reset chat when item changes
  useEffect(() => {
    setChatInput('');
    setAgentMessage('');
    setChatSessionId(null);
    setChatProducts([]);
    setShowChatResults(false);
    setFittingImageUrl(null);
  }, [item.id]);

  const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const message = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);
    setAgentMessage('검색 중...');
    haptic('tap');

    try {
      let response = await chatApi.send(message, chatSessionId || undefined, item.analysis_id);
      setChatSessionId(response.session_id);

      if (response.response.type.includes('pending')) {
        response = await pollUntilComplete(response, setAgentMessage);
      }

      setAgentMessage(truncateAgentMessage(response.response.text));

      if (response.response.data.products && response.response.data.products.length > 0) {
        setChatProducts(response.response.data.products);
        setShowChatResults(true);
      }

      if (response.response.type === 'fitting_result' && response.response.data.fitting_image_url) {
        setAgentMessage('피팅이 완료됐어요!');
        setFittingImageUrl(response.response.data.fitting_image_url);
      }

      haptic('success');
    } catch (error) {
      console.error('Chat error:', error);
      setAgentMessage('문제가 발생했어요');
      toast.error('메시지 전송에 실패했습니다');
      haptic('error');
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, chatSessionId, item.analysis_id, pollUntilComplete]);

  return {
    chatInput,
    setChatInput,
    agentMessage,
    setAgentMessage,
    isChatLoading,
    setIsChatLoading,
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
  };
}

export function useChatProductActions(
  selectedChatProduct: ChatProduct | null,
  chatProductSizes: string[],
  selectedChatSize: string | null,
  chatSessionId: string | null,
  analysisId: number | undefined,
  pollUntilComplete: ReturnType<typeof useChatPolling>['pollUntilComplete'],
  setAgentMessage: (msg: string) => void,
  setFittingImageUrl: (url: string | null) => void,
  user: UserProfile | null
) {
  const queryClient = useQueryClient();
  const [isChatAddingToCart, setIsChatAddingToCart] = useState(false);
  const [isChatPurchasing, setIsChatPurchasing] = useState(false);
  const [isChatFitting, setIsChatFitting] = useState(false);

  const handleChatAddToCart = useCallback(async () => {
    if (!selectedChatProduct) return;
    if (chatProductSizes.length > 0 && !selectedChatSize) return;

    setIsChatAddingToCart(true);
    try {
      await cartApi.add({
        selected_product_id: selectedChatProduct.product_id,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('장바구니에 담았어요');
      haptic('success');
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('장바구니 담기에 실패했어요');
      haptic('error');
      return false;
    } finally {
      setIsChatAddingToCart(false);
    }
  }, [selectedChatProduct, chatProductSizes.length, selectedChatSize, queryClient]);

  const handleChatPurchase = useCallback(async () => {
    if (!selectedChatProduct) return;
    if (chatProductSizes.length > 0 && !selectedChatSize) return;

    setIsChatPurchasing(true);
    try {
      const cartItem = await cartApi.add({
        selected_product_id: selectedChatProduct.product_id,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      const orderResponse = await ordersApi.create({
        cart_item_ids: [cartItem.cart_id],
        user_id: user?.user_id || 0,
        payment_method: 'card',
      });
      toast.success(`주문이 완료됐어요! (주문번호: ${orderResponse.order_id})`);
      haptic('success');
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('주문에 실패했어요');
      haptic('error');
      return false;
    } finally {
      setIsChatPurchasing(false);
    }
  }, [selectedChatProduct, chatProductSizes.length, selectedChatSize, queryClient, user?.user_id]);

  const handleChatFitting = useCallback(
    async (setChatSessionId: (id: string) => void) => {
      if (!selectedChatProduct) return;

      const productId = selectedChatProduct.product_id;
      setIsChatFitting(true);
      setAgentMessage('가상 피팅 중...');

      try {
        let response = await chatApi.send(
          `${productId}번 상품 피팅해줘`,
          chatSessionId || undefined,
          analysisId
        );

        setChatSessionId(response.session_id);

        if (response.response.type.includes('pending')) {
          response = await pollUntilComplete(response, setAgentMessage);
        }

        setAgentMessage(truncateAgentMessage(response.response.text));

        if (response.response.type === 'fitting_result' && response.response.data.fitting_image_url) {
          setFittingImageUrl(response.response.data.fitting_image_url);
        }

        haptic('success');
        return true;
      } catch (error) {
        console.error('Fitting error:', error);
        setAgentMessage('피팅에 실패했어요');
        haptic('error');
        return false;
      } finally {
        setIsChatFitting(false);
      }
    },
    [selectedChatProduct, chatSessionId, analysisId, pollUntilComplete, setAgentMessage, setFittingImageUrl]
  );

  return {
    isChatAddingToCart,
    isChatPurchasing,
    isChatFitting,
    handleChatAddToCart,
    handleChatPurchase,
    handleChatFitting,
  };
}

export function useProductActions(
  selectedProduct: { id: number; sizes?: Array<{ size_code_id: number; size_value: string; selected_product_id: number }> } | null | undefined,
  availableSizes: Array<{ size_code_id: number; size_value: string; selected_product_id: number }>,
  _selectedSizeCodeId: number | null, // Kept for UI display, not used in API calls
  selectedProductId: number | null, // This is the selected_product_id for cart API
  effectiveUserImageUrl: string | null | undefined,
  setAgentMessage: (msg: string) => void,
  setFittingImageUrl: (url: string | null) => void,
  setSelectedObjectId: (id: number | null) => void,
  user: UserProfile | null
) {
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isFitting, setIsFitting] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct) return;

    // If sizes are available, require a size selection
    if (availableSizes.length > 0) {
      if (!selectedProductId) {
        toast.error('사이즈를 선택해주세요');
        return;
      }
    }

    setIsAddingToCart(true);
    haptic('tap');

    try {
      // Use selected_product_id from size selection, or first size's selected_product_id if no sizes
      const productIdToUse = selectedProductId || availableSizes[0]?.selected_product_id;

      if (!productIdToUse) {
        toast.error('상품 정보를 찾을 수 없습니다');
        return;
      }

      await cartApi.add({
        selected_product_id: productIdToUse,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('장바구니에 추가되었습니다');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('장바구니 추가에 실패했습니다');
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedProduct, availableSizes, selectedProductId, queryClient]);

  const handlePurchase = useCallback(async () => {
    if (!selectedProduct) return;

    // If sizes are available, require a size selection
    if (availableSizes.length > 0) {
      if (!selectedProductId) {
        toast.error('사이즈를 선택해주세요');
        return;
      }
    }

    if (!user?.user_id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsPurchasing(true);
    haptic('tap');

    try {
      // Use selected_product_id from size selection
      const productIdToUse = selectedProductId || availableSizes[0]?.selected_product_id;

      if (!productIdToUse) {
        toast.error('상품 정보를 찾을 수 없습니다');
        return;
      }

      const cartResponse = await cartApi.add({
        selected_product_id: productIdToUse,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      await ordersApi.create({
        cart_item_ids: [cartResponse.cart_id],
        user_id: user.user_id,
        payment_method: 'card',
      });

      toast.success('주문이 완료되었습니다');
    } catch (error) {
      console.error('Failed to purchase:', error);
      toast.error('주문 처리에 실패했습니다');
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedProduct, availableSizes, selectedProductId, queryClient, user?.user_id]);

  const handleFitting = useCallback(async () => {
    if (!selectedProduct) return;

    if (!effectiveUserImageUrl) {
      toast.error('전신 사진을 먼저 등록해주세요');
      haptic('error');
      return;
    }

    const productId = selectedProduct.id;
    setIsFitting(true);
    setSelectedObjectId(null);
    setAgentMessage('가상 피팅 중...');
    haptic('tap');

    try {
      const startResponse = await fittingApi.request({
        product_id: productId,
        user_image_url: effectiveUserImageUrl,
      });

      const fittingId = startResponse.fitting_image_id;

      if (startResponse.fitting_image_status === 'DONE' && startResponse.fitting_image_url) {
        setFittingImageUrl(startResponse.fitting_image_url);
        setAgentMessage('피팅이 완료됐어요!');
        haptic('success');
        return;
      }

      for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        const statusResponse = await fittingApi.getStatus(fittingId);

        if (statusResponse.fitting_image_status === 'DONE') {
          const resultResponse = await fittingApi.getResult(fittingId);
          setFittingImageUrl(resultResponse.fitting_image_url);
          setAgentMessage('피팅이 완료됐어요!');
          haptic('success');
          return;
        }
      }

      throw new Error('Fitting timeout');
    } catch (error) {
      console.error('Fitting error:', error);
      setAgentMessage('피팅에 실패했어요');
      toast.error('피팅에 실패했습니다');
      haptic('error');
    } finally {
      setIsFitting(false);
    }
  }, [selectedProduct, effectiveUserImageUrl, setAgentMessage, setFittingImageUrl, setSelectedObjectId]);

  return {
    isAddingToCart,
    isPurchasing,
    isFitting,
    handleAddToCart,
    handlePurchase,
    handleFitting,
  };
}
