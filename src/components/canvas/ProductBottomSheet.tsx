import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Shirt } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import { toast } from 'sonner';
import { cartApi, fittingApi } from '@/api';
import { useUserStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatProduct } from '@/types/api';

// Polling constants for fitting
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 20;

interface ProductBottomSheetProps {
  products: ChatProduct[];
  selectedProductId: number | null;
  selectedProduct: ChatProduct | undefined;
  onProductSelect: (productId: number) => void;
  onFittingResult?: (imageUrl: string) => void;
  onDismiss: () => void;
}

export function ProductBottomSheet({
  products,
  selectedProductId,
  selectedProduct,
  onProductSelect,
  onFittingResult,
  onDismiss,
}: ProductBottomSheetProps) {
  const queryClient = useQueryClient();
  const { userImageUrl } = useUserStore();

  // Size selection state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Loading states
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFitting, setIsFitting] = useState(false);

  // Get available sizes from selected product
  const availableSizes = useMemo(() => {
    if (!selectedProduct?.sizes) return [];
    return selectedProduct.sizes.map((s) =>
      typeof s === 'object' && s !== null && 'size' in s
        ? (s as { size: string }).size
        : String(s)
    );
  }, [selectedProduct?.sizes]);

  // Reset size when product changes
  const handleProductSelect = useCallback((productId: number) => {
    onProductSelect(productId);
    setSelectedSize(null);
  }, [onProductSelect]);

  // Add to cart handler
  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct) return;

    // Require size selection if sizes are available
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error('사이즈를 선택해주세요');
      return;
    }

    setIsAddingToCart(true);
    haptic('tap');

    try {
      await cartApi.add({
        selected_product_id: selectedProduct.product_id,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('장바구니에 담았어요');
      haptic('success');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('장바구니 담기에 실패했어요');
      haptic('error');
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedProduct, availableSizes.length, selectedSize, queryClient]);

  // Fitting handler
  const handleFitting = useCallback(async () => {
    if (!selectedProduct) return;

    if (!userImageUrl) {
      toast.error('전신 사진을 먼저 등록해주세요');
      haptic('error');
      return;
    }

    setIsFitting(true);
    haptic('tap');

    try {
      const startResponse = await fittingApi.request({
        product_id: selectedProduct.product_id,
        user_image_url: userImageUrl,
      });

      const fittingId = startResponse.fitting_image_id;

      // Check if already done
      if (startResponse.fitting_image_status === 'DONE' && startResponse.fitting_image_url) {
        onFittingResult?.(startResponse.fitting_image_url);
        toast.success('피팅이 완료됐어요!');
        haptic('success');
        return;
      }

      // Poll for completion
      for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        const statusResponse = await fittingApi.getStatus(fittingId);

        if (statusResponse.fitting_image_status === 'DONE') {
          const resultResponse = await fittingApi.getResult(fittingId);
          onFittingResult?.(resultResponse.fitting_image_url);
          toast.success('피팅이 완료됐어요!');
          haptic('success');
          return;
        }
      }

      throw new Error('Fitting timeout');
    } catch (error) {
      console.error('Fitting error:', error);
      toast.error('피팅에 실패했어요');
      haptic('error');
    } finally {
      setIsFitting(false);
    }
  }, [selectedProduct, userImageUrl, onFittingResult]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl bg-black/95 backdrop-blur-lg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={springs.snappy}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) {
          onDismiss();
        }
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pb-2 pt-3">
        <div className="h-1 w-10 rounded-full bg-white/30" />
      </div>

      {/* Selected product quick view */}
      {selectedProduct && (
        <div className="px-4 pb-4">
          <div className="flex gap-3 rounded-2xl bg-white/10 p-3">
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.product_name}
              className="h-24 w-20 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-white/50">
                {selectedProduct.brand_name}
              </p>
              <h4
                className="mt-0.5 line-clamp-2 cursor-pointer text-sm font-medium text-white hover:underline"
                onClick={() => {
                  if (selectedProduct.product_url) {
                    window.open(selectedProduct.product_url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                {selectedProduct.product_name}
              </h4>
              <p className="mt-1 text-base font-bold text-white">
                {selectedProduct.selling_price.toLocaleString()}원
              </p>

              {/* Size selection */}
              {availableSizes.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1.5 text-[10px] text-white/50">사이즈 선택</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((size) => (
                      <motion.button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          haptic('tap');
                        }}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all',
                          selectedSize === size
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <motion.button
                  onClick={handleFitting}
                  disabled={isFitting}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium',
                    isFitting
                      ? 'cursor-not-allowed bg-white/10 text-white/40'
                      : 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFitting ? (
                    <motion.div
                      className="h-3 w-3 rounded-full border-2 border-purple-300/30 border-t-purple-300"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Shirt size={12} />
                  )}
                  {isFitting ? '피팅 중...' : 'Try on'}
                </motion.button>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={(availableSizes.length > 0 && !selectedSize) || isAddingToCart}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium',
                    (availableSizes.length > 0 && !selectedSize) || isAddingToCart
                      ? 'cursor-not-allowed bg-white/10 text-white/40'
                      : 'border border-white/20 bg-white/15 text-white'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAddingToCart ? (
                    <motion.div
                      className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <ShoppingBag size={12} />
                  )}
                  {isAddingToCart ? '담는 중...' : 'Add'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All products scroll */}
      <div className="px-4 pb-6">
        <p className="mb-2 text-xs text-white/50">All matches</p>
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {products.map((product) => (
            <motion.div
              key={product.product_id}
              className={cn(
                'w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl',
                selectedProductId === product.product_id && 'ring-2 ring-white'
              )}
              onClick={() => {
                handleProductSelect(product.product_id);
                haptic('tap');
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                  <span className="text-[10px] font-bold text-black">{product.index}</span>
                </div>
              </div>
              <div className="bg-white/10 p-2">
                <p className="truncate text-[10px] text-white/70">{product.brand_name}</p>
                <p className="text-xs font-medium text-white">
                  {(product.selling_price / 1000).toFixed(0)}K
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
