import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CreditCard, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, easings, springs, stagger } from '@/motion';
import type { ProductCandidate } from '@/types/api';

interface FittingFooterProps {
  product: ProductCandidate;
  selectedProductId: number | null;
  onSizeSelect: (selectedProductId: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isProcessing?: boolean;
}

export function FittingFooter({
  product,
  selectedProductId,
  onSizeSelect,
  onAddToCart,
  onBuyNow,
  isProcessing,
}: FittingFooterProps) {
  const hasSizes = product.sizes && product.sizes.length > 0;
  const canPurchase = !!selectedProductId || !hasSizes;

  const handleSizeSelect = (productId: number) => {
    haptic('select');
    onSizeSelect(productId);
  };

  const handleAddToCart = () => {
    if (!canPurchase || isProcessing) return;
    haptic('tap');
    onAddToCart();
  };

  const handleBuyNow = () => {
    if (!canPurchase || isProcessing) return;
    haptic('tap');
    onBuyNow();
  };

  return (
    <motion.footer
      className={cn(
        'relative p-6 pb-8 space-y-5 safe-bottom',
        // Glassmorphism
        'bg-white/[0.02] backdrop-blur-xl',
        'border-t border-white/[0.06]'
      )}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: easings.smooth }}
    >
      {/* Top gradient line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: easings.smooth }}
      />

      {/* Size Selection */}
      <AnimatePresence>
        {hasSizes && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...springs.gentle }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono tracking-[0.15em] text-white/40">
                사이즈 선택
              </p>
              {selectedProductId && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springs.bouncy}
                >
                  <Check size={12} className="text-white/60" />
                  <span className="text-[10px] font-mono text-white/40">선택됨</span>
                </motion.div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes!.map((size, index) => {
                if (typeof size === 'string') {
                  return (
                    <motion.button
                      key={index}
                      className={cn(
                        'px-5 py-3 rounded-xl',
                        'text-[11px] font-mono tracking-wider',
                        // Glassmorphism button
                        'bg-white/[0.03] backdrop-blur-sm',
                        'border border-white/[0.08]',
                        'text-white/50'
                      )}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stagger.cascade(index) }}
                    >
                      {size}
                    </motion.button>
                  );
                }

                const isSelected = selectedProductId === size.selected_product_id;
                const isOutOfStock = size.inventory === 0;
                const isSelectable = !isOutOfStock && size.selected_product_id !== null;

                return (
                  <motion.button
                    key={size.size_code_id}
                    onClick={() => isSelectable && handleSizeSelect(size.selected_product_id)}
                    disabled={!isSelectable}
                    className={cn(
                      'relative px-5 py-3 rounded-xl',
                      'text-[12px] font-medium tracking-wide',
                      'transition-all duration-300',
                      'border',
                      isSelected
                        ? [
                            'bg-white/10 border-white/30',
                            'text-white',
                            'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
                          ]
                        : isSelectable
                          ? [
                              'bg-white/[0.03] backdrop-blur-sm',
                              'border-white/[0.08]',
                              'text-white/70',
                              'hover:bg-white/[0.06] hover:border-white/[0.15]',
                              'hover:text-white/90',
                            ]
                          : [
                              'bg-white/[0.01]',
                              'border-white/[0.04]',
                              'text-white/20 line-through',
                              'cursor-not-allowed',
                            ]
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: stagger.cascade(index) + 0.1 }}
                    whileTap={isSelectable ? { scale: 0.95 } : {}}
                    whileHover={isSelectable ? { y: -2 } : {}}
                  >
                    {size.size || size.size_value}
                    {isSelected && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={springs.bouncy}
                      >
                        <Check size={8} className="text-black" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...springs.gentle }}
      >
        {/* Add to Cart */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!canPurchase || isProcessing}
          className={cn(
            'relative py-4 rounded-xl overflow-hidden',
            'text-[11px] font-mono uppercase tracking-[0.15em]',
            'flex items-center justify-center gap-2',
            'transition-all duration-300',
            // Glassmorphism button
            'border',
            canPurchase && !isProcessing
              ? [
                  'bg-white/[0.03] backdrop-blur-sm',
                  'border-white/[0.12]',
                  'text-white/80',
                  'hover:bg-white/[0.06] hover:border-white/[0.2]',
                  'active:scale-[0.98]',
                ]
              : [
                  'bg-white/[0.01]',
                  'border-white/[0.05]',
                  'text-white/30',
                  'cursor-not-allowed',
                ]
          )}
          whileTap={canPurchase && !isProcessing ? { scale: 0.98 } : {}}
          whileHover={canPurchase && !isProcessing ? { y: -1 } : {}}
        >
          <ShoppingBag size={14} />
          <span>장바구니</span>
        </motion.button>

        {/* Buy Now */}
        <motion.button
          onClick={handleBuyNow}
          disabled={!canPurchase || isProcessing}
          className={cn(
            'relative py-4 rounded-xl overflow-hidden',
            'text-[11px] font-mono uppercase tracking-[0.15em]',
            'flex items-center justify-center gap-2',
            'transition-all duration-300',
            canPurchase && !isProcessing
              ? [
                  'bg-white text-black',
                  'hover:bg-white/90',
                  'active:scale-[0.98]',
                  'shadow-[0_4px_20px_rgba(255,255,255,0.15)]',
                ]
              : [
                  'bg-white/10 text-white/30',
                  'cursor-not-allowed',
                ]
          )}
          whileTap={canPurchase && !isProcessing ? { scale: 0.98 } : {}}
          whileHover={
            canPurchase && !isProcessing
              ? { y: -1, boxShadow: '0 6px 30px rgba(255,255,255,0.2)' }
              : {}
          }
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span>처리 중</span>
              </motion.div>
            ) : (
              <motion.div
                key="buy"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CreditCard size={14} />
                <span>바로 구매</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shimmer effect on hover */}
          {canPurchase && !isProcessing && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              whileHover={{ translateX: '100%' }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Subtle hint when no size selected */}
      <AnimatePresence>
        {hasSizes && !selectedProductId && (
          <motion.p
            className="text-center text-[10px] text-white/30 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
          >
            사이즈를 선택해주세요
          </motion.p>
        )}
      </AnimatePresence>
    </motion.footer>
  );
}
