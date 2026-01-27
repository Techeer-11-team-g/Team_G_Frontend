import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useChat, useVoiceInput } from '@/hooks';
import { feedKeys } from '@/hooks/useFeed';
import { feedApi } from '@/api';
import { VirtualFittingRoom } from '@/features/tryon';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUserStore } from '@/store';
import { haptic } from '@/motion';
import { ImageAbsorption, useImageAbsorption } from '@/components/agent';
import { ImageAnalysisView } from '@/components/canvas';
import { PinterestFeed } from '@/components/feed';
import type { ProductCandidate } from '@/types/api';
import type { AgentState } from '@/components/agent';

import { AGENT_MESSAGES, PROGRESS_MESSAGES } from '../constants';
import { simplifyMessage, chatProductToCandidate } from '../helpers';
import { DragDropOverlay } from '../DragDropOverlay';

import { AgentHeader } from './AgentHeader';
import { AgentOrbSection } from './AgentOrbSection';
import { InputSection } from './InputSection';
import { ProductGrid } from './ProductGrid';
import { FittingResultView } from './FittingResultView';
import { BackToAgentFab } from './BackToAgentFab';
import { AmbientBackground } from './AmbientBackground';
import {
  useTypewriter,
  useScrollPosition,
  useKeyboardHeight,
  useScrollToTopOnMount,
  useFileUpload,
  useRequestType,
} from './hooks';
import type { AgentHomePageProps } from './types';

export function AgentHomePage({ hideHeader = false }: AgentHomePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat API Hook
  const {
    messages,
    isLoading,
    contentPanelData,
    agentState: chatAgentState,
    sendMessage,
    reset: resetChat,
    clearSession,
  } = useChat();

  // Local UI state
  const [localAgentState, setLocalAgentState] = useState<AgentState>('idle');
  const [agentMessage, setAgentMessage] = useState(AGENT_MESSAGES.idle[0]);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [lastUserQuery, setLastUserQuery] = useState(''); // 사용자 입력 저장
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);
  const [showFittingResult, setShowFittingResult] = useState(false);
  const [directFittingResultUrl, setDirectFittingResultUrl] = useState<string | null>(null);
  const progressStepRef = useRef(0);

  // Custom hooks
  useScrollToTopOnMount();
  const isInFeedSection = useScrollPosition(0.7);
  const keyboardHeight = useKeyboardHeight();
  const { currentRequestType, setCurrentRequestType, getRequestType } = useRequestType();
  const {
    pendingImageFile,
    pendingImagePreview,
    previewImage,
    setPreviewImage,
    handleFileChange,
    clearPendingImage,
    resetAll: resetFileUpload,
  } = useFileUpload();

  // Voice input
  const {
    isSupported: isVoiceSupported,
    state: voiceState,
    interimTranscript,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: 'ko-KR',
    onResult: (transcript) => {
      if (transcript.trim()) {
        setLastUserQuery(transcript.trim());
        sendMessage(transcript.trim());
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Sync agent state from chat hook with context-aware messages
  useEffect(() => {
    setLocalAgentState(chatAgentState);
    progressStepRef.current = 0;

    if (chatAgentState === 'idle') {
      setAgentMessage(AGENT_MESSAGES.idle[Math.floor(Math.random() * AGENT_MESSAGES.idle.length)]);
      setCurrentRequestType('idle');
      setLastUserQuery('');
    } else if (chatAgentState === 'thinking' || chatAgentState === 'searching') {
      // 사용자 입력을 포함한 메시지 표시
      if (lastUserQuery) {
        setAgentMessage(`"${lastUserQuery}" 요청 처리 중...`);
      } else {
        const messages = PROGRESS_MESSAGES[currentRequestType]?.thinking || AGENT_MESSAGES.thinking;
        setAgentMessage(messages[0]);
      }
    } else if (chatAgentState === 'presenting') {
      setShowParticleBurst(true);
      setTimeout(() => {
        setAgentMessage(
          AGENT_MESSAGES.presenting[Math.floor(Math.random() * AGENT_MESSAGES.presenting.length)]
        );
        setShowParticleBurst(false);
      }, 600);
    } else if (chatAgentState === 'error') {
      setAgentMessage(AGENT_MESSAGES.error[0]);
    }
  }, [chatAgentState, currentRequestType, setCurrentRequestType, lastUserQuery]);

  // Cycle through progress messages while processing
  useEffect(() => {
    if (chatAgentState !== 'thinking' && chatAgentState !== 'searching') return;

    const messageType = chatAgentState === 'thinking' ? 'thinking' : 'searching';
    const messages =
      PROGRESS_MESSAGES[currentRequestType]?.[messageType] || AGENT_MESSAGES[messageType];

    const interval = setInterval(() => {
      progressStepRef.current = (progressStepRef.current + 1) % messages.length;
      setAgentMessage(messages[progressStepRef.current]);
    }, 5000);

    return () => clearInterval(interval);
  }, [chatAgentState, currentRequestType]);

  // Show image analysis view when content panel has image analysis results
  useEffect(() => {
    if (contentPanelData.view === 'imageAnalysis' && contentPanelData.uploadedImageUrl) {
      setShowImageAnalysis(true);
    }
  }, [contentPanelData]);

  // Show fitting result view when content panel has fitting results
  useEffect(() => {
    if (contentPanelData.view === 'fitting' && contentPanelData.fittingImageUrl) {
      setShowFittingResult(true);
    }
  }, [contentPanelData]);

  // Get last assistant message for display (simplified)
  const lastAssistantMessage = useMemo(
    () => messages.filter((m) => m.role === 'assistant').pop(),
    [messages]
  );

  const displayMessage = lastAssistantMessage
    ? simplifyMessage(lastAssistantMessage.content, lastAssistantMessage.type, agentMessage)
    : agentMessage;

  // Image Absorption Hook
  const { imageSrc, isAbsorbing, startAbsorption, completeAbsorption } = useImageAbsorption();

  // Orb position for absorption
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });

  // Update orb position
  useEffect(() => {
    if (orbRef.current) {
      const rect = orbRef.current.getBoundingClientRect();
      setOrbPosition({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    }
  }, []);

  // User and cart state
  const { user } = useUserStore();
  const { items: cartItems } = useCart();

  // Try-on
  const [tryOnProduct, setTryOnProduct] = useState<ProductCandidate | null>(null);

  // Products from content panel
  const products = useMemo(
    () => contentPanelData.products?.map((p, i) => chatProductToCandidate(p, i)) || [],
    [contentPanelData.products]
  );

  // Typewriter
  const { displayedText, isTyping } = useTypewriter(displayMessage);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Handle mouse move for parallax
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 20);
        mouseY.set(y * 20);
      }
    },
    [mouseX, mouseY]
  );

  // Handle text submit
  const handleTextSubmit = useCallback(async () => {
    if (!textQuery.trim() && !pendingImageFile) return;

    haptic('tap');
    const query = textQuery.trim();
    const imageFile = pendingImageFile;

    // 사용자 입력 저장 (이미지만 있는 경우 "이미지 분석"으로 표시)
    setLastUserQuery(query || (imageFile ? '이미지 분석' : ''));
    setCurrentRequestType(getRequestType(query, !!imageFile));

    setTextQuery('');
    clearPendingImage();

    if (imageFile && previewImage) {
      startAbsorption(previewImage);
    }

    try {
      if (imageFile) {
        await sendMessage(query || '', imageFile);
      } else {
        await sendMessage(query);
      }
      haptic('success');
    } catch (err) {
      console.error('Message send failed:', err);
      toast.error('Failed to send message');
      haptic('error');
    }
  }, [textQuery, pendingImageFile, previewImage, sendMessage, startAbsorption, getRequestType, setCurrentRequestType, clearPendingImage]);

  // Handle voice button click
  const handleVoiceClick = useCallback(() => {
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState, startListening, stopListening]);

  // Handlers
  const handleReset = useCallback(() => {
    resetChat();
    setPreviewImage(null);
    setShowParticleBurst(false);
    setTextQuery('');
  }, [resetChat, setPreviewImage]);

  // Use Chat API for cart operations
  const handleAddToCart = async (index: number, size?: string, qty?: number) => {
    haptic('tap');
    setCurrentRequestType('cart');
    let message = `${index}번`;
    if (size) message += ` ${size}사이즈`;
    if (qty && qty > 1) message += ` ${qty}개`;
    message += ' 담아줘';
    setLastUserQuery(message);
    await sendMessage(message);
  };

  const handleBuy = async (index: number, size?: string, qty?: number) => {
    if (!user?.user_id) {
      navigate('/login');
      return;
    }
    haptic('tap');
    setCurrentRequestType('order');
    let message = `${index}번`;
    if (size) message += ` ${size}사이즈`;
    if (qty && qty > 1) message += ` ${qty}개`;
    message += ' 바로 주문할게';
    setLastUserQuery(message);
    await sendMessage(message);
  };

  const handleOrbClick = async () => {
    if (localAgentState === 'presenting' || messages.length > 0) {
      haptic('tap');
      await clearSession();
      setShowImageAnalysis(false);
      setShowFittingResult(false);
      resetFileUpload();
      toast.success('새로운 대화를 시작합니다');
    } else if (localAgentState === 'idle') {
      fileInputRef.current?.click();
    } else if (localAgentState === 'error') {
      handleReset();
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-full bg-black text-white antialiased"
      style={{ touchAction: 'pan-y' }}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient Background */}
      <AmbientBackground
        localAgentState={localAgentState}
        springX={springX}
        springY={springY}
      />

      {/* Header */}
      {!hideHeader && (
        <AgentHeader
          cartItemsCount={cartItems.length}
          onNavigate={navigate}
        />
      )}

      {/* Main Canvas */}
      <main className="relative flex flex-col" style={{ minHeight: '100%' }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Agent Zone (Center) */}
        <div
          className={`flex flex-col items-center px-6 pb-32 pt-20 ${
            localAgentState === 'presenting' && products.length > 0
              ? ''
              : 'min-h-screen justify-center'
          }`}
          style={{ touchAction: 'pan-y' }}
        >
          <AgentOrbSection
            orbRef={orbRef}
            localAgentState={localAgentState}
            showParticleBurst={showParticleBurst}
            displayedText={displayedText}
            isTyping={isTyping}
            isLoading={isLoading}
            onOrbClick={handleOrbClick}
          />

          {/* Results State - Product Grid */}
          <AnimatePresence>
            {localAgentState === 'presenting' &&
              (products.length > 0 || contentPanelData.fittingImageUrl) &&
              !tryOnProduct && (
                <ProductGrid
                  products={products}
                  previewImage={previewImage}
                  contentPanelData={contentPanelData}
                  showFittingResult={showFittingResult}
                  onReset={handleReset}
                  onShowImageAnalysis={() => setShowImageAnalysis(true)}
                  onShowFittingResult={() => setShowFittingResult(true)}
                  onTryOn={setTryOnProduct}
                  onAddToCart={handleAddToCart}
                  onBuy={handleBuy}
                />
              )}
          </AnimatePresence>
        </div>

        {/* Input Zone (Bottom) - Hidden in Feed Section */}
        <InputSection
          isInFeedSection={isInFeedSection}
          localAgentState={localAgentState}
          keyboardHeight={keyboardHeight}
          voiceState={voiceState}
          interimTranscript={interimTranscript}
          textQuery={textQuery}
          pendingImagePreview={pendingImagePreview}
          products={products}
          isLoading={isLoading}
          isVoiceSupported={isVoiceSupported}
          onTextQueryChange={setTextQuery}
          onSubmit={handleTextSubmit}
          onImageClick={() => fileInputRef.current?.click()}
          onVoiceClick={handleVoiceClick}
          onClearPendingImage={clearPendingImage}
        />

        {/* Image Absorption Animation */}
        <AnimatePresence>
          {imageSrc && (
            <ImageAbsorption
              imageSrc={imageSrc}
              isAbsorbing={isAbsorbing}
              orbPosition={orbPosition}
              onAbsorptionComplete={completeAbsorption}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Image Analysis View */}
      <AnimatePresence>
        {showImageAnalysis && contentPanelData.uploadedImageUrl && contentPanelData.products && (
          <ImageAnalysisView
            imageUrl={contentPanelData.uploadedImageUrl}
            products={contentPanelData.products}
            uploadedImageId={contentPanelData.uploadedImageId}
            showVisibilityPrompt={!!contentPanelData.uploadedImageId}
            onVisibilitySet={async (imageId, isPublic) => {
              await feedApi.toggleVisibility(imageId, { is_public: isPublic });
              queryClient.invalidateQueries({ queryKey: feedKeys.all });
              toast.success(isPublic ? '피드에 공개되었습니다' : '비공개로 설정되었습니다');
            }}
            onProductSelect={() => {
              haptic('tap');
            }}
            onFittingResult={(imageUrl) => {
              setDirectFittingResultUrl(imageUrl);
              setShowImageAnalysis(false);
            }}
            onClose={() => {
              setShowImageAnalysis(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Try-On Modal */}
      <AnimatePresence>
        {tryOnProduct && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <VirtualFittingRoom
              product={tryOnProduct}
              onClose={() => setTryOnProduct(null)}
              onAddToCart={() => {
                const idx = (tryOnProduct as ProductCandidate & { index: number }).index;
                handleAddToCart(idx);
                setTryOnProduct(null);
              }}
              onBuyNow={() => {
                const idx = (tryOnProduct as ProductCandidate & { index: number }).index;
                handleBuy(idx);
                setTryOnProduct(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fitting Result View */}
      <AnimatePresence>
        {showFittingResult && contentPanelData.fittingImageUrl && contentPanelData.fittingProduct && (
          <FittingResultView
            fittingImageUrl={contentPanelData.fittingImageUrl}
            fittingProduct={contentPanelData.fittingProduct}
            onClose={() => setShowFittingResult(false)}
            onAddToCart={() => sendMessage('장바구니에 담아줘')}
            onOrder={() => sendMessage('바로 주문할게')}
          />
        )}
      </AnimatePresence>

      {/* Direct Fitting Result Modal (from ProductBottomSheet/SidePanel) */}
      <AnimatePresence>
        {directFittingResultUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4">
              <h2 className="font-semibold text-white">피팅 결과</h2>
              <motion.button
                onClick={() => setDirectFittingResultUrl(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl text-white">&times;</span>
              </motion.button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
              <motion.img
                src={directFittingResultUrl}
                alt="Fitting result"
                className="max-h-full max-w-full rounded-2xl object-contain"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              />
            </div>
            <div className="p-4 pb-8">
              <motion.button
                onClick={() => setDirectFittingResultUrl(null)}
                className="mx-auto block w-full max-w-md rounded-xl bg-white py-3 text-sm font-medium text-black"
                whileTap={{ scale: 0.98 }}
              >
                닫기
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinterest Feed (only when not in embedded mode) */}
      {!hideHeader && (
        <div
          data-section="feed"
          className="relative z-10 min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black pb-20"
        >
          <PinterestFeed />
        </div>
      )}

      {/* Back to Agent FAB (in Feed Section) */}
      <BackToAgentFab show={!hideHeader && isInFeedSection} />

      {/* Drag & Drop Overlay */}
      <DragDropOverlay
        onFileDrop={(file) => {
          if (
            localAgentState !== 'idle' &&
            localAgentState !== 'error' &&
            localAgentState !== 'presenting'
          )
            return;

          const input = fileInputRef.current;
          if (input) {
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      />
    </div>
  );
}
