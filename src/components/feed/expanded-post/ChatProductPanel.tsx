import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, Shirt } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ChatProductPanelProps } from './types';

export const ChatProductPanel = memo(function ChatProductPanel({
  selectedChatProduct,
  chatProductSizes,
  selectedChatSize,
  isChatAddingToCart,
  isChatPurchasing,
  isChatFitting,
  onClose,
  onSizeSelect,
  onAddToCart,
  onPurchase,
  onFitting,
}: ChatProductPanelProps) {
  if (!selectedChatProduct) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 z-50 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-zinc-900"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            maxHeight: '60vh',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag="y"
          dragDirectionLock
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 300) {
              onClose();
            }
          }}
        >
          <div className="flex justify-center bg-zinc-900 pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/30" />
          </div>

          <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: 'calc(60vh - 40px)' }}>
            <div className="flex gap-4">
              <img
                src={selectedChatProduct.image_url}
                alt={selectedChatProduct.product_name}
                className="h-32 w-24 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  {selectedChatProduct.brand_name}
                </p>
                <h4
                  className="mt-1 line-clamp-2 cursor-pointer text-sm font-medium text-white hover:underline"
                  onClick={() => {
                    if (selectedChatProduct.product_url) {
                      window.open(
                        selectedChatProduct.product_url,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                >
                  {selectedChatProduct.product_name}
                </h4>
                <p className="mt-2 text-lg font-bold text-white">
                  {selectedChatProduct.selling_price?.toLocaleString()}
                </p>

                {chatProductSizes.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] text-white/50">사이즈 선택</p>
                    <div className="flex flex-wrap gap-2">
                      {chatProductSizes.map((size) => (
                        <motion.button
                          key={size}
                          onClick={() => onSizeSelect(size)}
                          className={cn(
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                            selectedChatSize === size
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
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <motion.button
                onClick={onFitting}
                disabled={isChatFitting}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium',
                  isChatFitting
                    ? 'cursor-not-allowed bg-white/10 text-white/40'
                    : 'border border-purple-500/30 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isChatFitting ? (
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-purple-300/30 border-t-purple-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Shirt size={16} />
                )}
                피팅
              </motion.button>

              <motion.button
                onClick={onAddToCart}
                disabled={
                  (chatProductSizes.length > 0 && !selectedChatSize) || isChatAddingToCart
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium',
                  (chatProductSizes.length > 0 && !selectedChatSize) || isChatAddingToCart
                    ? 'cursor-not-allowed bg-white/10 text-white/40'
                    : 'border border-white/20 bg-white/15 text-white hover:bg-white/25'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isChatAddingToCart ? (
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <ShoppingBag size={16} />
                )}
                담기
              </motion.button>

              <motion.button
                onClick={onPurchase}
                disabled={
                  (chatProductSizes.length > 0 && !selectedChatSize) || isChatPurchasing
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium',
                  (chatProductSizes.length > 0 && !selectedChatSize) || isChatPurchasing
                    ? 'cursor-not-allowed bg-white/20 text-white/40'
                    : 'bg-white text-black'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isChatPurchasing ? (
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Package size={16} />
                )}
                구매
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
});
