import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Shirt } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import { toast } from 'sonner';
import { cartApi, fittingApi } from '@/api';
import { useUserStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatProduct, ProductSize } from '@/types/api';

// Polling constants for fitting
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 20;

interface ProductSidePanelProps {
  products: ChatProduct[];
  selectedProductId: number | null;
  hoveredProductId: number | null;
  onProductSelect: (productId: number) => void;
  onProductHover: (productId: number | null) => void;
  onFittingResult?: (imageUrl: string) => void;
}

export function ProductSidePanel({
  products,
  selectedProductId,
  hoveredProductId,
  onProductSelect,
  onProductHover,
  onFittingResult,
}: ProductSidePanelProps) {
  const queryClient = useQueryClient();
  const { userImageUrl } = useUserStore();

  // Size selection state (per product) - stores full ProductSize or string
  const [selectedSizeData, setSelectedSizeData] = useState<Record<number, ProductSize | string>>({});

  // Loading states (per product)
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [fittingProduct, setFittingProduct] = useState<number | null>(null);

  // Get display value for a size
  const getSizeDisplayValue = (size: ProductSize | string): string => {
    if (typeof size === 'string') return size;
    return size.size_value || size.size || '';
  };

  // Get selected_product_id from size data
  const getSelectedProductIdFromSize = (sizeData: ProductSize | string | undefined): number | null => {
    if (!sizeData) return null;
    if (typeof sizeData === 'object' && 'selected_product_id' in sizeData) {
      return sizeData.selected_product_id;
    }
    return null;
  };

  // Add to cart handler
  const handleAddToCart = useCallback(async (e: React.MouseEvent, product: ChatProduct) => {
    e.stopPropagation();

    const hasSizes = product.sizes && product.sizes.length > 0;
    const selectedSize = selectedSizeData[product.product_id];

    // Require size selection if sizes are available
    if (hasSizes && !selectedSize) {
      toast.error('사이즈를 선택해주세요');
      return;
    }

    setAddingToCart(product.product_id);
    haptic('tap');

    try {
      // Use selected_product_id from size selection, fallback to product_id
      const selectedProductId = getSelectedProductIdFromSize(selectedSize) || product.product_id;

      await cartApi.add({
        selected_product_id: selectedProductId,
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
      setAddingToCart(null);
    }
  }, [selectedSizeData, queryClient]);

  // Fitting handler
  const handleFitting = useCallback(async (e: React.MouseEvent, product: ChatProduct) => {
    e.stopPropagation();

    if (!userImageUrl) {
      toast.error('전신 사진을 먼저 등록해주세요');
      haptic('error');
      return;
    }

    setFittingProduct(product.product_id);
    haptic('tap');

    try {
      const startResponse = await fittingApi.request({
        product_id: product.product_id,
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
      setFittingProduct(null);
    }
  }, [userImageUrl, onFittingResult]);

  return (
    <motion.div
      className="w-80 overflow-y-auto border-l border-white/10 bg-black/50 backdrop-blur-sm"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="p-4">
        <h3 className="mb-4 text-xs uppercase tracking-wider text-white/60">
          Matched Products
        </h3>

        <div className="space-y-3">
          {products.map((product) => {
            const isSelected = selectedProductId === product.product_id;
            const isHovered = hoveredProductId === product.product_id;
            const sizeList = product.sizes || [];
            const selectedSize = selectedSizeData[product.product_id];
            const isAddingToCart = addingToCart === product.product_id;
            const isFitting = fittingProduct === product.product_id;

            return (
              <motion.div
                key={product.product_id}
                className={cn(
                  'relative cursor-pointer overflow-hidden rounded-xl transition-all',
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
                  onProductSelect(product.product_id);
                  haptic('tap');
                }}
                onMouseEnter={() => onProductHover(product.product_id)}
                onMouseLeave={() => onProductHover(null)}
                animate={{
                  scale: isSelected ? 1.02 : 1,
                }}
                transition={springs.snappy}
              >
                {isSelected && (
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}

                <div className="flex gap-3 p-3">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{
                        background: isSelected ? 'white' : 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <span className="text-[10px] font-bold text-black">
                        {product.index}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] uppercase tracking-wider text-white/40">
                      {product.brand_name}
                    </p>
                    <h4
                      className="mb-1 line-clamp-2 cursor-pointer text-xs text-white/90 hover:text-white hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.product_url) {
                          window.open(product.product_url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      {product.product_name}
                    </h4>
                    <p className="text-sm font-semibold text-white">
                      {product.selling_price.toLocaleString()}원
                    </p>
                    {product.category && (
                      <p className="mt-1 text-[9px] capitalize text-white/40">
                        {product.category}
                      </p>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="px-3 pb-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {/* Size selection */}
                      {sizeList.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-1.5 text-[9px] text-white/50">사이즈 선택</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sizeList.map((size, idx) => {
                              const displayValue = getSizeDisplayValue(size);
                              const isThisSizeSelected = selectedSize && getSizeDisplayValue(selectedSize) === displayValue;
                              return (
                                <button
                                  key={typeof size === 'string' ? size : size.selected_product_id || idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSizeData((prev) => ({
                                      ...prev,
                                      [product.product_id]: size,
                                    }));
                                    haptic('tap');
                                  }}
                                  className={cn(
                                    'rounded-md px-2 py-1 text-[10px] font-medium transition-all',
                                    isThisSizeSelected
                                      ? 'bg-white text-black'
                                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                                  )}
                                >
                                  {displayValue}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleFitting(e, product)}
                          disabled={isFitting}
                          className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium',
                            isFitting
                              ? 'cursor-not-allowed bg-white/10 text-white/40'
                              : 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                          )}
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
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={(sizeList.length > 0 && !selectedSize) || isAddingToCart}
                          className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium',
                            (sizeList.length > 0 && !selectedSize) || isAddingToCart
                              ? 'cursor-not-allowed bg-white/10 text-white/40'
                              : 'border border-white/20 bg-white/15 text-white'
                          )}
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
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
