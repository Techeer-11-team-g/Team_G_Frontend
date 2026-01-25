import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import type { ChatProduct } from '@/types/api';
import { VisibilityModal } from './VisibilityModal';
import { ProductBottomSheet } from './ProductBottomSheet';
import { ProductSidePanel } from './ProductSidePanel';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';

interface ImageAnalysisViewProps {
  imageUrl: string;
  products: ChatProduct[];
  onProductSelect: (product: ChatProduct) => void;
  onFittingResult?: (imageUrl: string) => void;
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
  onFittingResult,
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
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden relative overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* Image with overlays - full screen on mobile */}
        <div
          className={cn(
            "relative flex items-start justify-center",
            isMobile ? "p-2 pt-4 pb-48" : "flex-1 p-6 overflow-y-auto"
          )}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Image wrapper - overlays are positioned relative to this */}
          <motion.div
            className="relative inline-block"
            style={{ touchAction: 'pan-y' }}
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
                  ? "max-w-full"
                  : "max-w-full max-h-[80vh]"
              )}
              onLoad={() => setImageLoaded(true)}
              style={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                touchAction: 'pan-y',
                pointerEvents: 'none',
              }}
            />

            {/* Bounding box overlays - positioned relative to image */}
            {imageLoaded && imageSize.width > 0 && productsWithBBox.map((product, idx) => (
              <BoundingBoxOverlay
                key={product.product_id}
                product={product}
                idx={idx}
                imageSize={imageSize}
                isSelected={selectedProductId === product.product_id}
                isHovered={hoveredProductId === product.product_id}
                isMobile={isMobile}
                onClick={() => handleBBoxClick(product)}
                onMouseEnter={() => !isMobile && setHoveredProductId(product.product_id)}
                onMouseLeave={() => !isMobile && setHoveredProductId(null)}
              />
            ))}
          </motion.div>
        </div>

        {/* Product panel - Desktop: side panel, Mobile: bottom sheet */}
        {isMobile ? (
          // Mobile: Bottom sheet
          <AnimatePresence>
            {(showProductPanel || selectedProduct) && (
              <ProductBottomSheet
                products={products}
                selectedProductId={selectedProductId}
                selectedProduct={selectedProduct}
                onProductSelect={setSelectedProductId}
                onFittingResult={onFittingResult}
                onDismiss={() => {
                  setShowProductPanel(false);
                  setSelectedProductId(null);
                }}
              />
            )}
          </AnimatePresence>
        ) : (
          // Desktop: Side panel
          <ProductSidePanel
            products={products}
            selectedProductId={selectedProductId}
            hoveredProductId={hoveredProductId}
            onProductSelect={setSelectedProductId}
            onProductHover={setHoveredProductId}
            onFittingResult={onFittingResult}
          />
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
          <VisibilityModal
            isSettingVisibility={isSettingVisibility}
            onVisibilitySelect={handleVisibilitySelect}
            onSkip={() => {
              setShowVisibilityModal(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
