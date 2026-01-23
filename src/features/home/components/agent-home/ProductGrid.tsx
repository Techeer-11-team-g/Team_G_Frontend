import { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Sparkles } from 'lucide-react';
import { haptic } from '@/motion';
import { AgentProductCard } from '../AgentProductCard';
import type { ProductGridProps, ImagePreviewProps, FittingPreviewProps } from './types';

export const ImagePreview = memo(function ImagePreview({
  previewImage,
  productsCount,
  isImageAnalysis,
  onShowImageAnalysis,
  onReset,
}: ImagePreviewProps) {
  return (
    <motion.div
      className="mb-8 flex items-center justify-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className={`relative h-16 w-12 overflow-hidden rounded-lg ${
          isImageAnalysis ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (isImageAnalysis) {
            haptic('tap');
            onShowImageAnalysis();
          }
        }}
        whileHover={isImageAnalysis ? { scale: 1.05 } : {}}
        whileTap={isImageAnalysis ? { scale: 0.95 } : {}}
      >
        <img
          src={previewImage}
          alt="Source"
          className="h-full w-full object-cover"
        />
        {isImageAnalysis && (
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
          {productsCount}개 상품 발견
        </p>
        {isImageAnalysis && (
          <button
            onClick={() => {
              haptic('tap');
              onShowImageAnalysis();
            }}
            className="mb-1 text-[10px] text-white/50 transition-colors hover:text-white"
          >
            분석 보기
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
        >
          새로 검색 <X size={12} />
        </button>
      </div>
    </motion.div>
  );
});

export const FittingPreview = memo(function FittingPreview({
  fittingImageUrl,
  fittingProduct,
  onShowFittingResult,
}: FittingPreviewProps) {
  return (
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
          onShowFittingResult();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <img
          src={fittingImageUrl}
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
          {fittingProduct.brand_name}
        </p>
        <p className="line-clamp-1 max-w-[120px] text-xs font-medium text-white/80">
          {fittingProduct.product_name}
        </p>
        <button
          onClick={() => {
            haptic('tap');
            onShowFittingResult();
          }}
          className="mt-1 flex items-center gap-1 text-[10px] text-white/50 transition-colors hover:text-white"
        >
          <Eye size={10} />
          피팅 보기
        </button>
      </div>
    </motion.div>
  );
});

export const ProductGrid = memo(function ProductGrid({
  products,
  previewImage,
  contentPanelData,
  showFittingResult,
  onReset,
  onShowImageAnalysis,
  onShowFittingResult,
  onTryOn,
  onAddToCart,
  onBuy,
}: ProductGridProps) {
  return (
    <motion.div
      className="w-full max-w-5xl"
      style={{ touchAction: 'pan-y' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Source image & reset */}
      {previewImage && (
        <ImagePreview
          previewImage={previewImage}
          productsCount={products.length}
          isImageAnalysis={!!contentPanelData.isImageAnalysis}
          onShowImageAnalysis={onShowImageAnalysis}
          onReset={onReset}
        />
      )}

      {/* Fitting result preview (when closed) */}
      {!showFittingResult &&
        contentPanelData.fittingImageUrl &&
        contentPanelData.fittingProduct && (
          <FittingPreview
            fittingImageUrl={contentPanelData.fittingImageUrl}
            fittingProduct={contentPanelData.fittingProduct}
            onShowFittingResult={onShowFittingResult}
          />
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
            index={i}
            onTryOn={() => onTryOn(product)}
            onAddToCart={(size, qty) => onAddToCart(i, size, qty)}
            onBuy={(size, qty) => onBuy(i, size, qty)}
            isProcessing={false}
          />
        ))}
      </motion.div>
    </motion.div>
  );
});
