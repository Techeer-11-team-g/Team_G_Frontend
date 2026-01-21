import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { ShoppingBag, User, Camera, X, Sparkles, Package, ChevronDown, Eye } from 'lucide-react';
import { useChat, useVoiceInput } from '@/hooks';
import { feedApi } from '@/api';
import { VirtualFittingRoom } from '@/features/tryon';
import { useUserStore, useCartStore } from '@/store';
import { haptic, easings, springs } from '@/motion';
import { AgentOrb, ImageAbsorption, useImageAbsorption, ParticleBurst } from '@/components/agent';
import { MagneticInput } from '@/components/input';
import { ImageAnalysisView } from '@/components/canvas';
import { PinterestFeed } from '@/components/feed';
import type { ProductCandidate, ChatProduct } from '@/types/api';
import type { AgentState } from '@/components/agent';

// =============================================
// Agent Messages
// =============================================
const AGENT_MESSAGES = {
  idle: [
    '이미지를 업로드해서 상품을 찾아보세요.',
    '오늘은 어떤 상품을 찾고 계신가요?',
    '이미지를 넣어주시면 상품을 찾아드릴게요.',
  ],
  thinking: ['분석 중이에요...', '잠시만 기다려주세요...'],
  searching: ['최적의 상품을 찾고 있어요...', '수천 개의 상품 중에서 검색 중이에요...'],
  presenting: ['딱 맞는 상품을 찾았어요!', '좋은 상품들을 찾았어요'],
  error: ['문제가 발생했어요. 다시 시도해주세요', '이미지를 처리할 수 없었어요'],
};

// Context-aware progress messages
type RequestType = 'idle' | 'image_search' | 'text_search' | 'fitting' | 'cart' | 'order';
const PROGRESS_MESSAGES: Record<RequestType, { thinking: string[]; searching: string[] }> = {
  idle: {
    thinking: ['처리 중...'],
    searching: ['검색 중...'],
  },
  image_search: {
    thinking: ['이미지 분석 중...', '스타일 파악 중...', '패션 아이템 감지 중...'],
    searching: ['비슷한 상품 찾는 중...', '매칭 상품 검색 중...', '거의 다 됐어요...'],
  },
  text_search: {
    thinking: ['요청 분석 중...', '검색어 이해 중...'],
    searching: ['상품 검색 중...', '최적의 상품 찾는 중...', '거의 완료...'],
  },
  fitting: {
    thinking: ['피팅 준비 중...', '가상 피팅 시작...'],
    searching: ['AI가 피팅 이미지 생성 중...', '잠시만 기다려주세요...', '거의 완료...'],
  },
  cart: {
    thinking: ['장바구니에 추가 중...'],
    searching: ['처리 중...'],
  },
  order: {
    thinking: ['주문 처리 중...'],
    searching: ['결제 준비 중...'],
  },
};

// =============================================
// Typewriter Hook
// =============================================
function useTypewriter(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(
      () => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      },
      speed + Math.random() * 30
    );

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}

// =============================================
// Convert ChatProduct to ProductCandidate (for compatibility)
// =============================================
function chatProductToCandidate(
  product: ChatProduct,
  index: number
): ProductCandidate & { index: number } {
  return {
    brand: product.brand_name,
    name: product.product_name,
    price: product.selling_price,
    image: product.image_url,
    image_url: product.image_url,
    source_url: product.product_url,
    match_type: 'Exact',
    color_vibe: '',
    product_id: product.product_id,
    sizes: product.sizes,
    index: product.index ?? index + 1,
  };
}

// =============================================
// Main Component
// =============================================
export function AgentHomePage() {
  const navigate = useNavigate();
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [currentRequestType, setCurrentRequestType] = useState<RequestType>('idle');
  const [showFittingResult, setShowFittingResult] = useState(false);
  const [isInFeedSection, setIsInFeedSection] = useState(false);
  const progressStepRef = useRef(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Detect scroll position to hide input bar in feed section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      // Hide input bar when scrolled past 70% of viewport
      setIsInFeedSection(scrollY > viewportHeight * 0.7);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      // Send the voice transcript to chat
      if (transcript.trim()) {
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
    progressStepRef.current = 0; // Reset progress step

    if (chatAgentState === 'idle') {
      setAgentMessage(AGENT_MESSAGES.idle[Math.floor(Math.random() * AGENT_MESSAGES.idle.length)]);
      setCurrentRequestType('idle');
    } else if (chatAgentState === 'thinking') {
      const messages = PROGRESS_MESSAGES[currentRequestType]?.thinking || AGENT_MESSAGES.thinking;
      setAgentMessage(messages[0]);
    } else if (chatAgentState === 'searching') {
      const messages = PROGRESS_MESSAGES[currentRequestType]?.searching || AGENT_MESSAGES.searching;
      setAgentMessage(messages[0]);
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
  }, [chatAgentState, currentRequestType]);

  // Cycle through progress messages while processing
  useEffect(() => {
    if (chatAgentState !== 'thinking' && chatAgentState !== 'searching') return;

    const messageType = chatAgentState === 'thinking' ? 'thinking' : 'searching';
    const messages =
      PROGRESS_MESSAGES[currentRequestType]?.[messageType] || AGENT_MESSAGES[messageType];

    const interval = setInterval(() => {
      progressStepRef.current = (progressStepRef.current + 1) % messages.length;
      setAgentMessage(messages[progressStepRef.current]);
    }, 5000); // Change message every 5 seconds

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
  const lastAssistantMessage = messages.filter((m) => m.role === 'assistant').pop();

  // Simplify message - extract core parts, remove product list
  const simplifyMessage = (text: string, type?: string): string => {
    if (!text) return agentMessage;

    // For search results, extract intro and ending question
    if (type === 'search_results') {
      // Remove numbered list (1. ... 2. ... etc)
      const lines = text.split('\n').filter((line) => !line.match(/^\d+\.\s/));
      // Get first line (intro) and last line (question)
      const intro = lines[0]?.replace(/:\s*$/, '') || '';
      const question = lines[lines.length - 1] || '';

      if (intro && question && intro !== question) {
        return `${intro}. ${question}`;
      }
      return intro || question || text;
    }

    // For other types, just return the text (but limit length)
    if (text.length > 100) {
      // Find the last sentence
      const sentences = text.split(/[.!?]\s/);
      if (sentences.length > 1) {
        return sentences[sentences.length - 1];
      }
    }

    return text;
  };

  const displayMessage = lastAssistantMessage
    ? simplifyMessage(lastAssistantMessage.content, lastAssistantMessage.type)
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
  const cartItems = useCartStore((s) => s.items);

  // Try-on
  const [tryOnProduct, setTryOnProduct] = useState<ProductCandidate | null>(null);

  // Products from content panel
  const products = contentPanelData.products?.map((p, i) => chatProductToCandidate(p, i)) || [];

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

  // Handle file input change - store image for preview, don't send yet
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file for later sending
    setPendingImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setPendingImagePreview(imageData);
      setPreviewImage(imageData);
      haptic('tap');
    };
    reader.readAsDataURL(file);

    // Reset input element
    e.target.value = '';
  }, []);

  // Clear pending image
  const clearPendingImage = useCallback(() => {
    setPendingImageFile(null);
    setPendingImagePreview(null);
  }, []);

  // Determine request type from message content
  const getRequestType = useCallback((query: string, hasImage: boolean): RequestType => {
    if (hasImage) return 'image_search';
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('피팅') || lowerQuery.includes('입어')) return 'fitting';
    if (lowerQuery.includes('담아') || lowerQuery.includes('장바구니')) return 'cart';
    if (lowerQuery.includes('주문') || lowerQuery.includes('구매') || lowerQuery.includes('결제'))
      return 'order';
    return 'text_search';
  }, []);

  // Handle text submit - sends text with pending image if any
  const handleTextSubmit = useCallback(async () => {
    // Need either text or pending image to submit
    if (!textQuery.trim() && !pendingImageFile) return;

    haptic('tap');
    const query = textQuery.trim();
    const imageFile = pendingImageFile;

    // Set request type for progress messages
    setCurrentRequestType(getRequestType(query, !!imageFile));

    // Clear inputs
    setTextQuery('');
    setPendingImageFile(null);
    setPendingImagePreview(null);

    // Start absorption animation if there's an image
    if (imageFile && previewImage) {
      startAbsorption(previewImage);
    }

    try {
      // Send with image if pending, otherwise just text
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
  }, [textQuery, pendingImageFile, previewImage, sendMessage, startAbsorption, getRequestType]);

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
  }, [resetChat]);

  // Use Chat API for cart operations (handles size selection flow)
  const handleAddToCart = async (index: number, size?: string, qty?: number) => {
    haptic('tap');
    setCurrentRequestType('cart');
    // Build message with optional size and quantity
    let message = `${index}번`;
    if (size) message += ` ${size}사이즈`;
    if (qty && qty > 1) message += ` ${qty}개`;
    message += ' 담아줘';
    await sendMessage(message);
  };

  const handleBuy = async (index: number, size?: string, qty?: number) => {
    if (!user?.user_id) {
      navigate('/login');
      return;
    }
    haptic('tap');
    setCurrentRequestType('order');
    // Build message with optional size and quantity
    let message = `${index}번`;
    if (size) message += ` ${size}사이즈`;
    if (qty && qty > 1) message += ` ${qty}개`;
    message += ' 바로 주문할게';
    // Send via Chat API - will handle size selection and ordering
    await sendMessage(message);
  };

  const handleOrbClick = async () => {
    // If presenting or has content, reset the session
    if (localAgentState === 'presenting' || messages.length > 0) {
      haptic('tap');
      await clearSession();
      setShowImageAnalysis(false);
      setShowFittingResult(false);
      setPreviewImage(null);
      setPendingImageFile(null);
      setPendingImagePreview(null);
      toast.success('새로운 대화를 시작합니다');
    } else if (localAgentState === 'idle') {
      // If idle with no content, open file picker
      fileInputRef.current?.click();
    } else if (localAgentState === 'error') {
      handleReset();
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden bg-black text-white antialiased"
      onMouseMove={handleMouseMove}
    >
      {/* ========== Ambient Background ========== */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full"
          style={{
            background:
              localAgentState === 'presenting'
                ? 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            left: '50%',
            top: '40%',
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale:
              localAgentState === 'thinking' || localAgentState === 'searching' ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ========== Header ========== */}
      <header className="fixed inset-x-0 top-0 z-50 px-6 py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <motion.a
            href="/"
            className="text-[13px] font-light tracking-[0.3em] text-white/80 transition-colors hover:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DRESSENSE
          </motion.a>

          <motion.div
            className="flex items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/orders')}
              className="text-white/60 transition-colors duration-300 hover:text-white"
              title="주문내역"
            >
              <Package size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-white/60 transition-colors duration-300 hover:text-white"
              title="장바구니"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartItems.length > 0 && (
                <motion.span
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-black"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springs.bouncy}
                >
                  {cartItems.length}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="text-white/60 transition-colors duration-300 hover:text-white"
              title="프로필"
            >
              <User size={18} strokeWidth={1.5} />
            </button>
          </motion.div>
        </nav>
      </header>

      {/* ========== Main Canvas ========== */}
      <main className="relative flex min-h-screen flex-col">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ===== Agent Zone (Center) ===== */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-20">
          {/* Agent Orb */}
          <motion.div
            ref={orbRef}
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: easings.smooth }}
          >
            <AgentOrb
              state={localAgentState}
              size="lg"
              onClick={handleOrbClick}
              showPulse={localAgentState !== 'presenting'}
            />

            {/* Particle Burst on results */}
            <AnimatePresence>
              {showParticleBurst && (
                <ParticleBurst
                  isActive={showParticleBurst}
                  particleCount={20}
                  colors={['#ffffff', '#e0e0e0', '#c0c0c0']}
                  duration={0.8}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Agent Message */}
          <motion.div
            className="mb-8 max-w-md text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="whitespace-pre-line text-lg font-light tracking-wide text-white/70">
              {displayedText}
              {isTyping && (
                <motion.span
                  className="ml-1 inline-block h-5 w-0.5 bg-white/50 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>

            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-white/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ===== Idle State - Hint Text ===== */}
          <AnimatePresence>
            {localAgentState === 'idle' && (
              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs tracking-wide text-white/30">
                  아래 텍스트를 입력하거나 이미지를 업로드해주세요!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Results State - Product Grid ===== */}
          <AnimatePresence>
            {localAgentState === 'presenting' &&
              (products.length > 0 || contentPanelData.fittingImageUrl) &&
              !tryOnProduct && (
                <motion.div
                  className="w-full max-w-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Source image & reset */}
                  {previewImage && (
                    <motion.div
                      className="mb-8 flex items-center justify-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className={`relative h-16 w-12 overflow-hidden rounded-lg ${
                          contentPanelData.isImageAnalysis ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => {
                          if (
                            contentPanelData.isImageAnalysis &&
                            contentPanelData.uploadedImageUrl
                          ) {
                            haptic('tap');
                            setShowImageAnalysis(true);
                          }
                        }}
                        whileHover={contentPanelData.isImageAnalysis ? { scale: 1.05 } : {}}
                        whileTap={contentPanelData.isImageAnalysis ? { scale: 0.95 } : {}}
                      >
                        <img
                          src={previewImage}
                          alt="Source"
                          className="h-full w-full object-cover"
                        />
                        {contentPanelData.isImageAnalysis && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                            <Eye
                              size={14}
                              className="text-white opacity-0 group-hover:opacity-100"
                            />
                          </div>
                        )}
                      </motion.div>
                      <div className="text-center">
                        <p className="mb-1 text-xs text-white/40">
                          {products.length}개 상품 발견
                        </p>
                        {contentPanelData.isImageAnalysis && (
                          <button
                            onClick={() => {
                              haptic('tap');
                              setShowImageAnalysis(true);
                            }}
                            className="mb-1 text-[10px] text-white/50 transition-colors hover:text-white"
                          >
                            분석 보기
                          </button>
                        )}
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                        >
                          새로 검색 <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Fitting result preview (when closed) */}
                  {!showFittingResult &&
                    contentPanelData.fittingImageUrl &&
                    contentPanelData.fittingProduct && (
                      <motion.div
                        className="mb-8 flex items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="relative h-20 w-16 cursor-pointer overflow-hidden rounded-xl"
                          onClick={() => {
                            haptic('tap');
                            setShowFittingResult(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
                            border: '2px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <img
                            src={contentPanelData.fittingImageUrl}
                            alt="Fitting result"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                            <Sparkles size={12} className="text-white/80" />
                          </div>
                        </motion.div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-wider text-white/40">
                            {contentPanelData.fittingProduct.brand_name}
                          </p>
                          <p className="line-clamp-1 max-w-[120px] text-xs font-medium text-white/80">
                            {contentPanelData.fittingProduct.product_name}
                          </p>
                          <button
                            onClick={() => {
                              haptic('tap');
                              setShowFittingResult(true);
                            }}
                            className="mt-1 flex items-center gap-1 text-[10px] text-white/50 transition-colors hover:text-white"
                          >
                            <Eye size={10} />
                            피팅 보기
                          </button>
                        </div>
                      </motion.div>
                    )}

                  {/* Product Grid with emergence animation */}
                  <motion.div
                    className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08, delayChildren: 0.3 },
                      },
                    }}
                  >
                    {products.map((product, i) => (
                      <AgentProductCard
                        key={product.product_id ?? i}
                        product={product}
                        index={product.index}
                        onTryOn={() => setTryOnProduct(product)}
                        onAddToCart={(size, qty) => handleAddToCart(product.index, size, qty)}
                        onBuy={(size, qty) => handleBuy(product.index, size, qty)}
                        isProcessing={false}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* ===== Input Zone (Bottom) - Hidden in Feed Section ===== */}
        <AnimatePresence>
          {!isInFeedSection &&
            (localAgentState === 'idle' ||
              localAgentState === 'presenting' ||
              localAgentState === 'error') && (
              <motion.div
                className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
              >
                <div className="mx-auto max-w-md space-y-3">
                  {/* Voice listening indicator */}
                  <AnimatePresence>
                    {voiceState === 'listening' && (
                      <motion.div
                        className="flex items-center justify-center gap-3 py-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        {/* Pulsing mic indicator */}
                        <motion.div
                          className="relative"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <motion.div
                            className="absolute inset-0 h-3 w-3 rounded-full bg-red-500"
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </motion.div>
                        <span className="text-sm text-white/70">
                          {interimTranscript || '듣고 있어요...'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pending Image Preview */}
                  <AnimatePresence>
                    {pendingImagePreview && (
                      <motion.div
                        className="mb-3 flex items-center gap-3 px-2"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20 }}
                      >
                        <div className="relative">
                          <motion.img
                            src={pendingImagePreview}
                            alt="Upload preview"
                            className="h-14 w-14 rounded-xl object-cover"
                            style={{
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              border: '2px solid rgba(255,255,255,0.2)',
                            }}
                            layoutId="pending-image"
                          />
                          <motion.button
                            onClick={clearPendingImage}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={12} className="text-white" />
                          </motion.button>
                        </div>
                        <span className="text-xs text-white/50">
                          메시지를 입력하거나 바로 전송하세요
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <MagneticInput
                    value={voiceState === 'listening' ? interimTranscript : textQuery}
                    onChange={setTextQuery}
                    onSubmit={handleTextSubmit}
                    onImageClick={() => fileInputRef.current?.click()}
                    onVoiceClick={isVoiceSupported ? handleVoiceClick : undefined}
                    placeholder={
                      voiceState === 'listening'
                        ? '말씀하세요...'
                        : pendingImagePreview
                          ? '이 이미지로 뭘 찾을까요? (예: 상의만 찾아줘)'
                          : products.length > 0
                            ? '검색을 더 구체화해보세요...'
                            : '원하는 스타일을 설명하거나 이미지를 업로드하세요...'
                    }
                    magneticStrength={0.15}
                    showImageButton={!pendingImagePreview}
                    showVoiceButton={isVoiceSupported && !pendingImagePreview}
                    isVoiceListening={voiceState === 'listening'}
                    disabled={isLoading}
                    allowEmptySubmit={!!pendingImagePreview}
                  />
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* ===== Image Absorption Animation ===== */}
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

        {/* ===== Scroll Down Indicator (right side) ===== */}
        <AnimatePresence>
          {localAgentState === 'idle' && messages.length === 0 && (
            <motion.div
              className="absolute bottom-32 right-6 flex items-center gap-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 1 }}
            >
              <span
                className="text-[10px] uppercase tracking-widest text-white/30"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                스크롤하여 둘러보기
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown size={16} className="text-white/30" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========== Image Analysis View ========== */}
      <AnimatePresence>
        {showImageAnalysis && contentPanelData.uploadedImageUrl && contentPanelData.products && (
          <ImageAnalysisView
            imageUrl={contentPanelData.uploadedImageUrl}
            products={contentPanelData.products}
            uploadedImageId={contentPanelData.uploadedImageId}
            showVisibilityPrompt={!!contentPanelData.uploadedImageId}
            onVisibilitySet={async (imageId, isPublic) => {
              await feedApi.toggleVisibility(imageId, { is_public: isPublic });
              toast.success(isPublic ? '피드에 공개되었습니다' : '비공개로 설정되었습니다');
            }}
            onProductSelect={() => {
              haptic('tap');
              // Could scroll to or highlight product in list
            }}
            onAddToCart={(index) => {
              handleAddToCart(index);
            }}
            onTryOn={(product) => {
              setShowImageAnalysis(false);
              setTryOnProduct(chatProductToCandidate(product, (product.index || 1) - 1));
            }}
            onClose={() => {
              setShowImageAnalysis(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ========== Try-On Modal ========== */}
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

      {/* ========== Fitting Result View ========== */}
      <AnimatePresence>
        {showFittingResult && contentPanelData.fittingImageUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="font-semibold text-white">피팅 결과</h2>
              <motion.button
                onClick={() => setShowFittingResult(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} className="text-white" />
              </motion.button>
            </div>

            {/* Fitting Image */}
            <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
              <motion.img
                src={contentPanelData.fittingImageUrl}
                alt="Fitting result"
                className="max-h-full max-w-full rounded-2xl object-contain"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              />
            </div>

            {/* Product Info & Actions */}
            {contentPanelData.fittingProduct && (
              <motion.div
                className="p-4 pb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mx-auto max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    {contentPanelData.fittingProduct.brand_name}
                  </p>
                  <h3
                    className="mt-1 cursor-pointer font-medium text-white hover:underline"
                    onClick={() => {
                      const url = contentPanelData.fittingProduct?.product_url;
                      if (url) window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {contentPanelData.fittingProduct.product_name}
                  </h3>
                  <p className="mt-1 font-bold text-white">
                    ₩{contentPanelData.fittingProduct.selling_price?.toLocaleString()}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <motion.button
                      onClick={() => {
                        haptic('tap');
                        sendMessage('장바구니에 담아줘');
                      }}
                      className="flex-1 rounded-xl py-3 text-sm font-medium text-white"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      whileHover={{ background: 'rgba(255,255,255,0.25)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingBag size={16} className="mr-2 inline" />
                      담기
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        haptic('tap');
                        sendMessage('바로 주문할게');
                      }}
                      className="flex-1 rounded-xl bg-white py-3 text-sm font-medium text-black"
                      whileHover={{ background: 'rgba(255,255,255,0.9)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      주문하기
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Pinterest Feed ========== */}
      <div
        data-section="feed"
        className="relative z-10 min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black pb-20"
      >
        <PinterestFeed />
      </div>

      {/* ========== Back to Agent FAB (in Feed Section) ========== */}
      <AnimatePresence>
        {isInFeedSection && (
          <motion.button
            onClick={() => {
              haptic('tap');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
          >
            <Sparkles size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========== Drag & Drop Overlay ========== */}
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

// =============================================
// Drag & Drop Overlay
// =============================================
function DragDropOverlay({ onFileDrop }: { onFileDrop: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file?.type.startsWith('image/')) {
        onFileDrop(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFileDrop]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/40"
              animate={{
                borderColor: [
                  'rgba(255,255,255,0.4)',
                  'rgba(255,255,255,0.8)',
                  'rgba(255,255,255,0.4)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Camera size={32} className="text-white/60" />
            </motion.div>
            <p className="text-lg text-white/80">여기에 이미지를 놓아주세요</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================
// Agent Product Card with emergence animation
// =============================================
function AgentProductCard({
  product,
  index,
  onTryOn,
  onAddToCart,
  onBuy,
  isProcessing,
}: {
  product: ProductCandidate;
  index: number;
  onTryOn: () => void;
  onAddToCart: (size?: string, quantity?: number) => void;
  onBuy: (size?: string, quantity?: number) => void;
  isProcessing: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  // Get available sizes - handle both string[] and object[] formats
  const availableSizes =
    product.sizes
      ?.map((s) => {
        if (typeof s === 'string') return s;
        // Handle both { size: 'M' } and { size_value: 'M' } formats
        return (
          (s as { size?: string; size_value?: string }).size ||
          (s as { size?: string; size_value?: string }).size_value ||
          ''
        );
      })
      .filter(Boolean) || [];

  // 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <motion.article
      ref={cardRef}
      className="group cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.9 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', damping: 20, stiffness: 100 },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: hovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: hovered
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Glass reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
          <motion.img
            src={product.image_url || product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0 }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: easings.smooth }}
          />

          {/* Gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />

          {/* Match Score Badge */}
          {product.similarity_score !== undefined && (
            <motion.div
              className="absolute left-3 top-3 rounded-full px-2.5 py-1"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] font-medium tabular-nums text-white/80">
                {Math.round(product.similarity_score * 100)}% 일치
              </span>
            </motion.div>
          )}

          {/* Index Number Badge */}
          <motion.div
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-xs font-semibold text-white">{index}</span>
          </motion.div>

          {/* Actions on hover */}
          <motion.div
            className="absolute inset-x-3 bottom-3 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onTryOn();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-medium text-white"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={12} />
              Try on
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                if (availableSizes.length > 0 && !selectedSize) {
                  setShowSizeSelector(true);
                } else {
                  onAddToCart(selectedSize || undefined, quantity);
                }
              }}
              className="flex-1 rounded-xl py-2.5 text-[11px] font-medium text-white"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedSize ? `담기 (${selectedSize})` : '담기'}
            </motion.button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-white/40">
            {product.brand || '브랜드'}
          </p>
          <h3
            className="mb-2 line-clamp-1 cursor-pointer text-sm font-medium text-white/90 transition-colors hover:text-white hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              const url = product.source_url || (product as { product_url?: string }).product_url;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {product.name}
          </h3>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-white/50">사이즈</span>
                {selectedSize && <span className="text-[10px] text-white/70">{selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSizes.slice(0, 5).map((size) => (
                  <motion.button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(selectedSize === size ? null : size);
                    }}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
                {availableSizes.length > 5 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSizeSelector(true);
                    }}
                    className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium text-white/70 hover:bg-white/20"
                    whileTap={{ scale: 0.95 }}
                  >
                    +{availableSizes.length - 5}
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] text-white/50">수량</span>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20"
                whileTap={{ scale: 0.9 }}
              >
                -
              </motion.button>
              <span className="w-6 text-center text-xs tabular-nums text-white">{quantity}</span>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => Math.min(10, q + 1));
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20"
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {typeof product.price === 'number'
                ? `₩${(product.price * quantity).toLocaleString()}`
                : product.price}
            </span>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onBuy(selectedSize || undefined, quantity);
              }}
              disabled={isProcessing || (availableSizes.length > 0 && !selectedSize)}
              className={`text-[11px] font-medium transition-colors ${
                availableSizes.length > 0 && !selectedSize
                  ? 'cursor-not-allowed text-white/30'
                  : 'text-white/50 hover:text-white'
              }`}
              whileHover={availableSizes.length === 0 || selectedSize ? { x: 2 } : {}}
            >
              {isProcessing ? '...' : '바로 구매 →'}
            </motion.button>
          </div>
        </div>

        {/* Full Size Selector Modal */}
        <AnimatePresence>
          {showSizeSelector && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col bg-black/90 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowSizeSelector(false);
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-white">사이즈 선택</span>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizeSelector(false);
                  }}
                  className="text-white/50 hover:text-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="flex flex-1 flex-wrap content-start gap-2">
                {availableSizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                      setShowSizeSelector(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
