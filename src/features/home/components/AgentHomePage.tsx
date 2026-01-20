import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { ShoppingBag, User, Camera, X, Sparkles, Package } from 'lucide-react';
import { useChat } from '@/hooks';
import { VirtualFittingRoom } from '@/features/tryon';
import { useCart } from '@/features/cart';
import { ordersApi } from '@/api';
import { useUserStore, useCartStore } from '@/store';
import { haptic, easings, springs } from '@/motion';
import {
  AgentOrb,
  ImageAbsorption,
  useImageAbsorption,
  ParticleBurst,
} from '@/components/agent';
import { MagneticInput } from '@/components/input';
import type { ProductCandidate, ChatProduct } from '@/types/api';
import type { AgentState } from '@/components/agent';

// =============================================
// Agent Messages
// =============================================
const AGENT_MESSAGES = {
  idle: ['Upload an image to discover your style', 'What style are you looking for today?', 'Drop an image and I will find similar items'],
  thinking: ['Analyzing your style...', 'Understanding the aesthetic...', 'Processing the image...'],
  searching: ['Finding the best matches...', 'Searching through thousands of items...', 'Almost there...'],
  presenting: ['Here are your perfect matches!', 'Found some great options for you', 'Check out these similar styles'],
  error: ['Something went wrong. Try again?', 'Could not process the image'],
};

// =============================================
// Typewriter Hook
// =============================================
function useTypewriter(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed + Math.random() * 20);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText };
}

// =============================================
// Convert ChatProduct to ProductCandidate (for compatibility)
// =============================================
function chatProductToCandidate(product: ChatProduct, index: number): ProductCandidate & { index: number } {
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
    sendImage,
    reset: resetChat,
  } = useChat();

  // Local UI state
  const [localAgentState, setLocalAgentState] = useState<AgentState>('idle');
  const [agentMessage, setAgentMessage] = useState(AGENT_MESSAGES.idle[0]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [textQuery, setTextQuery] = useState('');

  // Sync agent state from chat hook
  useEffect(() => {
    setLocalAgentState(chatAgentState);

    if (chatAgentState === 'idle') {
      setAgentMessage(AGENT_MESSAGES.idle[Math.floor(Math.random() * AGENT_MESSAGES.idle.length)]);
    } else if (chatAgentState === 'thinking') {
      setAgentMessage(AGENT_MESSAGES.thinking[Math.floor(Math.random() * AGENT_MESSAGES.thinking.length)]);
    } else if (chatAgentState === 'searching') {
      setAgentMessage(AGENT_MESSAGES.searching[Math.floor(Math.random() * AGENT_MESSAGES.searching.length)]);
    } else if (chatAgentState === 'presenting') {
      setShowParticleBurst(true);
      setTimeout(() => {
        setAgentMessage(AGENT_MESSAGES.presenting[Math.floor(Math.random() * AGENT_MESSAGES.presenting.length)]);
        setShowParticleBurst(false);
      }, 600);
    } else if (chatAgentState === 'error') {
      setAgentMessage(AGENT_MESSAGES.error[0]);
    }
  }, [chatAgentState]);

  // Get last assistant message for display
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const displayMessage = lastAssistantMessage?.content || agentMessage;

  // Image Absorption Hook
  const {
    imageSrc,
    isAbsorbing,
    startAbsorption,
    completeAbsorption,
  } = useImageAbsorption();

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

  // Commerce
  const { addToCart } = useCart();
  const { user } = useUserStore();
  const cartItems = useCartStore((s) => s.items);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Try-on
  const [tryOnProduct, setTryOnProduct] = useState<ProductCandidate | null>(null);

  // Products from content panel
  const products = contentPanelData.products?.map((p, i) => chatProductToCandidate(p, i)) || [];

  // Typewriter
  const { displayedText } = useTypewriter(displayMessage);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Handle mouse move for parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      mouseX.set(x * 20);
      mouseY.set(y * 20);
    }
  }, [mouseX, mouseY]);

  // Handle file input change
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setPreviewImage(imageData);
      haptic('tap');

      // Start absorption animation
      startAbsorption(imageData);
    };
    reader.readAsDataURL(file);

    // Send to chat API
    setTimeout(async () => {
      try {
        await sendImage(file);
        haptic('success');
      } catch (err) {
        console.error('Image upload failed:', err);
        toast.error('Failed to upload image');
        haptic('error');
      }
    }, 800);

    // Reset input
    e.target.value = '';
  }, [sendImage, startAbsorption]);

  // Handle text submit
  const handleTextSubmit = useCallback(async () => {
    if (!textQuery.trim()) return;

    haptic('tap');
    const query = textQuery;
    setTextQuery('');

    try {
      await sendMessage(query);
    } catch (err) {
      console.error('Message send failed:', err);
      toast.error('Failed to send message');
      haptic('error');
    }
  }, [textQuery, sendMessage]);

  // Handlers
  const handleReset = useCallback(() => {
    resetChat();
    setPreviewImage(null);
    setShowParticleBurst(false);
    setTextQuery('');
  }, [resetChat]);

  const handleAddToCart = async (id: number) => {
    haptic('tap');
    await addToCart(id, 1);
    toast.success('Added to cart');
  };

  const handleBuy = async (id: number) => {
    if (!user?.user_id) {
      navigate('/login');
      return;
    }
    setProcessingId(id);
    try {
      const cartItemId = await addToCart(id, 1);
      const order = await ordersApi.create({
        cart_item_ids: [cartItemId],
        user_id: user.user_id,
        payment_method: 'card',
      });
      haptic('purchase');
      navigate(`/orders/${order.order_id}`);
    } catch {
      toast.error('Failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOrbClick = () => {
    if (localAgentState === 'idle') {
      fileInputRef.current?.click();
    } else if (localAgentState === 'error') {
      handleReset();
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white antialiased overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ========== Ambient Background ========== */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: localAgentState === 'presenting'
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
            scale: localAgentState === 'thinking' || localAgentState === 'searching' ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ========== Header ========== */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-5">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.a
            href="/"
            className="text-[13px] tracking-[0.3em] font-light text-white/80 hover:text-white transition-colors"
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
              className="text-white/60 hover:text-white transition-colors duration-300"
              title="주문내역"
            >
              <Package size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-white/60 hover:text-white transition-colors duration-300"
              title="장바구니"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartItems.length > 0 && (
                <motion.span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[9px] rounded-full flex items-center justify-center font-medium"
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
              className="text-white/60 hover:text-white transition-colors duration-300"
              title="프로필"
            >
              <User size={18} strokeWidth={1.5} />
            </button>
          </motion.div>
        </nav>
      </header>

      {/* ========== Main Canvas ========== */}
      <main className="relative min-h-screen flex flex-col">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ===== Agent Zone (Center) ===== */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32">
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
            className="text-center mb-8 max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-white/70 text-lg font-light tracking-wide">
              {displayedText}
              <motion.span
                className="inline-block w-0.5 h-5 bg-white/50 ml-1 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
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
                        className="w-1.5 h-1.5 rounded-full bg-white/50"
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
                <p className="text-white/30 text-xs tracking-wide">
                  Use the input below or drop an image anywhere
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Results State - Product Grid ===== */}
          <AnimatePresence>
            {localAgentState === 'presenting' && products.length > 0 && !tryOnProduct && (
              <motion.div
                className="w-full max-w-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Source image & reset */}
                {previewImage && (
                  <motion.div
                    className="flex items-center justify-center gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden">
                      <img src={previewImage} alt="Source" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/40 text-xs mb-1">{products.length} matches found</p>
                      <button
                        onClick={handleReset}
                        className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1"
                      >
                        New search <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Product Grid with emergence animation */}
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
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
                      onAddToCart={() => product.product_id && handleAddToCart(product.product_id)}
                      onBuy={() => product.product_id && handleBuy(product.product_id)}
                      isProcessing={processingId === product.product_id}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== Input Zone (Bottom) ===== */}
        <AnimatePresence>
          {(localAgentState === 'idle' || localAgentState === 'presenting' || localAgentState === 'error') && (
            <motion.div
              className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="max-w-md mx-auto">
                <MagneticInput
                  value={textQuery}
                  onChange={setTextQuery}
                  onSubmit={handleTextSubmit}
                  onImageClick={() => fileInputRef.current?.click()}
                  placeholder={
                    products.length > 0
                      ? "Refine your search..."
                      : "Describe your style or upload an image..."
                  }
                  magneticStrength={0.15}
                  showImageButton={true}
                  disabled={isLoading}
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
      </main>

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
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuy}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Drag & Drop Overlay ========== */}
      <DragDropOverlay
        onFileDrop={(file) => {
          if (localAgentState !== 'idle' && localAgentState !== 'error' && localAgentState !== 'presenting') return;

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
              className="w-24 h-24 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center mb-4 mx-auto"
              animate={{ borderColor: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Camera size={32} className="text-white/60" />
            </motion.div>
            <p className="text-white/80 text-lg">Drop your image here</p>
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
  onAddToCart: () => void;
  onBuy: () => void;
  isProcessing: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

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
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: hovered
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Glass reflection */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <motion.img
            src={product.image_url || product.image}
            alt={product.name}
            className="w-full h-full object-cover"
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
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] text-white/80 tabular-nums font-medium">
                {Math.round(product.similarity_score * 100)}% match
              </span>
            </motion.div>
          )}

          {/* Index Number Badge */}
          <motion.div
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-xs text-white font-semibold">{index}</span>
          </motion.div>

          {/* Actions on hover */}
          <motion.div
            className="absolute bottom-3 inset-x-3 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => { e.stopPropagation(); onTryOn(); }}
              className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-medium flex items-center justify-center gap-1.5"
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
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              className="flex-1 py-2.5 rounded-xl text-[11px] text-white font-medium"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              Add
            </motion.button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-medium">
            {product.brand || 'Brand'}
          </p>
          <h3 className="text-sm text-white/90 line-clamp-1 mb-2 font-medium">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-semibold">
              {typeof product.price === 'number'
                ? `₩${product.price.toLocaleString()}`
                : product.price}
            </span>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onBuy(); }}
              disabled={isProcessing}
              className="text-[11px] text-white/50 hover:text-white transition-colors font-medium"
              whileHover={{ x: 2 }}
            >
              {isProcessing ? '...' : 'Buy now →'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
