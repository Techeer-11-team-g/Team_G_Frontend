import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Sparkles, Globe, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import type { ChatProduct } from '@/types/api';

interface ImageAnalysisViewProps {
  imageUrl: string;
  products: ChatProduct[];
  onProductSelect: (product: ChatProduct) => void;
  onAddToCart: (index: number) => void;
  onTryOn: (product: ChatProduct) => void;
  onClose: () => void;
  /** Optional: Image ID for visibility toggle */
  uploadedImageId?: number;
  /** Optional: Callback when visibility is set */
  onVisibilitySet?: (imageId: number, isPublic: boolean) => Promise<void>;
  /** Whether to show the visibility prompt on close */
  showVisibilityPrompt?: boolean;
}

export function ImageAnalysisView({
  imageUrl,
  products,
  onProductSelect,
  onAddToCart,
  onTryOn,
  onClose,
  uploadedImageId,
  onVisibilitySet,
  showVisibilityPrompt = true,
}: ImageAnalysisViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [isSettingVisibility, setIsSettingVisibility] = useState(false);

  // Handle close with optional visibility prompt
  const handleClose = useCallback(() => {
    if (showVisibilityPrompt && uploadedImageId && onVisibilitySet) {
      setShowVisibilityModal(true);
    } else {
      onClose();
    }
  }, [showVisibilityPrompt, uploadedImageId, onVisibilitySet, onClose]);

  // Handle visibility selection
  const handleVisibilitySelect = async (isPublic: boolean) => {
    if (!uploadedImageId || !onVisibilitySet) {
      onClose();
      return;
    }

    setIsSettingVisibility(true);
    try {
      await onVisibilitySet(uploadedImageId, isPublic);
    } catch (error) {
      console.error('Failed to set visibility:', error);
    } finally {
      setIsSettingVisibility(false);
      setShowVisibilityModal(false);
      onClose();
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate image display size using ResizeObserver for accuracy
  useEffect(() => {
    if (!imageRef.current || !imageLoaded) return;

    const updateImageSize = () => {
      if (imageRef.current) {
        // Use offsetWidth/offsetHeight for more accurate sizing
        const width = imageRef.current.offsetWidth;
        const height = imageRef.current.offsetHeight;
        if (width > 0 && height > 0) {
          setImageSize({ width, height });
        }
      }
    };

    // Initial calculation with small delay to ensure render is complete
    const timeoutId = setTimeout(updateImageSize, 50);

    // Use ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(updateImageSize);
    resizeObserver.observe(imageRef.current);

    // Also listen to window resize
    window.addEventListener('resize', updateImageSize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateImageSize);
    };
  }, [imageLoaded, isMobile]);

  const handleBBoxClick = useCallback((product: ChatProduct) => {
    haptic('tap');
    setSelectedProductId(product.product_id);
    onProductSelect(product);
    // On mobile, show the product panel when a bbox is clicked
    if (isMobile) {
      setShowProductPanel(true);
    }
  }, [onProductSelect, isMobile]);

  // Get products with bounding boxes
  const productsWithBBox = products.filter((p) => p.bbox);

  // Get selected product
  const selectedProduct = products.find((p) => p.product_id === selectedProductId);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header - compact on mobile */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-black/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-white/80 text-xs md:text-sm font-medium tracking-wide">
            {productsWithBBox.length > 0
              ? `${productsWithBBox.length} items detected`
              : `${products.length} matches`
            }
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={20} className="text-white/70" />
        </button>
      </div>

      {/* Main content - different layout for mobile vs desktop */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Image with overlays - full screen on mobile */}
        <div
          className={cn(
            "relative flex items-center justify-center overflow-auto",
            isMobile ? "flex-1 p-2" : "flex-1 p-6"
          )}
        >
          {/* Image wrapper - overlays are positioned relative to this */}
          <motion.div
            className="relative inline-block"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Analyzed image"
              className={cn(
                "block rounded-xl md:rounded-2xl",
                isMobile
                  ? "max-w-full max-h-[calc(100vh-180px)]"
                  : "max-w-full max-h-[80vh]"
              )}
              onLoad={() => setImageLoaded(true)}
              style={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />

            {/* Bounding box overlays - positioned relative to image */}
            {imageLoaded && imageSize.width > 0 && productsWithBBox.map((product, idx) => {
              const bbox = product.bbox!;
              const isSelected = selectedProductId === product.product_id;
              const isHovered = hoveredProductId === product.product_id;

              // Calculate position from normalized coordinates (0-1)
              const left = bbox.x1 * imageSize.width;
              const top = bbox.y1 * imageSize.height;
              const width = (bbox.x2 - bbox.x1) * imageSize.width;
              const height = (bbox.y2 - bbox.y1) * imageSize.height;

              // Badge position inside bbox - rotate corners
              const badgePositions = [
                { top: 4, left: 4 },
                { top: 4, right: 4 },
                { bottom: 4, left: 4 },
                { bottom: 4, right: 4 },
              ];
              const badgePos = badgePositions[idx % 4];

              return (
                <motion.div
                  key={product.product_id}
                  className="absolute cursor-pointer"
                  style={{
                    left,
                    top,
                    width,
                    height,
                  }}
                  onClick={() => handleBBoxClick(product)}
                  onMouseEnter={() => !isMobile && setHoveredProductId(product.product_id)}
                  onMouseLeave={() => !isMobile && setHoveredProductId(null)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (product.index || 0) * 0.1 }}
                >
                  {/* Bounding box border */}
                  <motion.div
                    className="absolute inset-0 rounded-md md:rounded-lg"
                    style={{
                      border: isSelected
                        ? '3px solid rgba(255, 255, 255, 0.95)'
                        : isHovered
                        ? '2px solid rgba(255, 255, 255, 0.7)'
                        : '2px solid rgba(255, 255, 255, 0.5)',
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.2)'
                        : isHovered
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isSelected
                        ? '0 0 30px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                        : '0 0 15px rgba(255, 255, 255, 0.2)',
                    }}
                    animate={{
                      scale: isSelected ? 1.02 : 1,
                    }}
                    transition={springs.snappy}
                  />

                  {/* Index badge */}
                  <motion.div
                    className={cn(
                      "absolute rounded-full flex items-center justify-center z-10",
                      isMobile ? "w-6 h-6" : "w-7 h-7"
                    )}
                    style={{
                      ...badgePos,
                      background: isSelected
                        ? 'white'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.3)',
                    }}
                    animate={{
                      scale: isSelected || isHovered ? 1.15 : 1,
                    }}
                  >
                    <span
                      className={cn(
                        'font-bold text-black',
                        isMobile ? 'text-[10px]' : 'text-xs'
                      )}
                    >
                      {product.index || idx + 1}
                    </span>
                  </motion.div>

                  {/* Pulse animation */}
                  {!isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-md md:rounded-lg border-2 border-white/40"
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.01, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Product panel - Desktop: side panel, Mobile: bottom sheet */}
        {isMobile ? (
          // Mobile: Bottom sheet
          <AnimatePresence>
            {(showProductPanel || selectedProduct) && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg rounded-t-3xl z-30"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={springs.snappy}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100) {
                    setShowProductPanel(false);
                    setSelectedProductId(null);
                  }
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-white/30" />
                </div>

                {/* Selected product quick view */}
                {selectedProduct && (
                  <div className="px-4 pb-4">
                    <div className="flex gap-3 p-3 rounded-2xl bg-white/10">
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.product_name}
                        className="w-20 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider">
                          {selectedProduct.brand_name}
                        </p>
                        <h4
                          className="text-sm text-white font-medium line-clamp-2 mt-0.5 cursor-pointer hover:underline"
                          onClick={() => {
                            if (selectedProduct.product_url) {
                              window.open(selectedProduct.product_url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {selectedProduct.product_name}
                        </h4>
                        <p className="text-base text-white font-bold mt-1">
                          ₩{selectedProduct.selling_price.toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              haptic('tap');
                              onTryOn(selectedProduct);
                            }}
                            className="flex-1 py-2 rounded-xl text-xs text-white font-medium flex items-center justify-center gap-1"
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          >
                            <Sparkles size={12} />
                            Try on
                          </button>
                          <button
                            onClick={() => {
                              haptic('tap');
                              if (selectedProduct.index) {
                                onAddToCart(selectedProduct.index);
                              }
                            }}
                            className="flex-1 py-2 rounded-xl text-xs text-white font-medium flex items-center justify-center gap-1"
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          >
                            <ShoppingBag size={12} />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All products scroll */}
                <div className="px-4 pb-6">
                  <p className="text-white/50 text-xs mb-2">All matches</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {products.map((product) => (
                      <motion.div
                        key={product.product_id}
                        className={cn(
                          "flex-shrink-0 w-24 cursor-pointer rounded-xl overflow-hidden",
                          selectedProductId === product.product_id && "ring-2 ring-white"
                        )}
                        onClick={() => {
                          setSelectedProductId(product.product_id);
                          haptic('tap');
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="relative">
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">
                              {product.index}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-white/10">
                          <p className="text-[10px] text-white/70 truncate">
                            {product.brand_name}
                          </p>
                          <p className="text-xs text-white font-medium">
                            ₩{(product.selling_price / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          // Desktop: Side panel
          <motion.div
            className="w-80 border-l border-white/10 overflow-y-auto bg-black/50 backdrop-blur-sm"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-4">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">
                Matched Products
              </h3>

              <div className="space-y-3">
                {products.map((product) => {
                  const isSelected = selectedProductId === product.product_id;
                  const isHovered = hoveredProductId === product.product_id;

                  return (
                    <motion.div
                      key={product.product_id}
                      className={cn(
                        'relative rounded-xl overflow-hidden cursor-pointer transition-all',
                        isSelected && 'ring-2 ring-white/50'
                      )}
                      style={{
                        background: isSelected
                          ? 'rgba(255,255,255,0.15)'
                          : isHovered
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.05)',
                      }}
                      onClick={() => {
                        setSelectedProductId(product.product_id);
                        haptic('tap');
                      }}
                      onMouseEnter={() => setHoveredProductId(product.product_id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                      animate={{
                        scale: isSelected ? 1.02 : 1,
                      }}
                      transition={springs.snappy}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}

                      <div className="flex gap-3 p-3">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: isSelected
                                ? 'white'
                                : 'rgba(255,255,255,0.9)',
                            }}
                          >
                            <span className="text-[10px] font-bold text-black">
                              {product.index}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">
                            {product.brand_name}
                          </p>
                          <h4
                            className="text-xs text-white/90 line-clamp-2 mb-1 cursor-pointer hover:text-white hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (product.product_url) {
                                window.open(product.product_url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            {product.product_name}
                          </h4>
                          <p className="text-sm text-white font-semibold">
                            ₩{product.selling_price.toLocaleString()}
                          </p>
                          {product.category && (
                            <p className="text-[9px] text-white/40 capitalize mt-1">
                              {product.category}
                            </p>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            className="flex gap-2 px-3 pb-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptic('tap');
                                onTryOn(product);
                              }}
                              className="flex-1 py-2 rounded-lg text-[11px] text-white font-medium flex items-center justify-center gap-1.5"
                              style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              <Sparkles size={12} />
                              Try on
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptic('tap');
                                if (product.index) {
                                  onAddToCart(product.index);
                                }
                              }}
                              className="flex-1 py-2 rounded-lg text-[11px] text-white font-medium flex items-center justify-center gap-1.5"
                              style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              <ShoppingBag size={12} />
                              Add
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile: Hint to tap items */}
        {isMobile && !showProductPanel && !selectedProduct && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <p className="text-white/70 text-xs">
                Tap on detected items to see details
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Visibility Prompt Modal */}
      <AnimatePresence>
        {showVisibilityModal && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-900 rounded-3xl p-6 mx-4 max-w-sm w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
            >
              <h3 className="text-white text-lg font-semibold text-center mb-2">
                분석 결과 공유하기
              </h3>
              <p className="text-white/50 text-sm text-center mb-6">
                다른 사용자들이 내 스타일을 볼 수 있도록 공개할까요?
              </p>

              <div className="space-y-3">
                {/* Public option */}
                <motion.button
                  onClick={() => handleVisibilitySelect(true)}
                  disabled={isSettingVisibility}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Globe size={24} className="text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">공개</p>
                    <p className="text-white/50 text-xs">
                      Discover 피드에 공유됩니다
                    </p>
                  </div>
                </motion.button>

                {/* Private option */}
                <motion.button
                  onClick={() => handleVisibilitySelect(false)}
                  disabled={isSettingVisibility}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock size={24} className="text-white/60" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">비공개</p>
                    <p className="text-white/50 text-xs">
                      나만 볼 수 있습니다
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* Loading state */}
              {isSettingVisibility && (
                <div className="flex items-center justify-center gap-2 mt-4 text-white/50 text-sm">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  저장 중...
                </div>
              )}

              {/* Skip button */}
              <button
                onClick={() => {
                  setShowVisibilityModal(false);
                  onClose();
                }}
                disabled={isSettingVisibility}
                className="w-full mt-4 py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                나중에 설정하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
