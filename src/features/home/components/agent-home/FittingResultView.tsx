import { memo } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { haptic } from '@/motion';
import type { ChatProduct } from '@/types/api';

interface FittingResultViewProps {
  fittingImageUrl: string;
  fittingProduct: ChatProduct;
  onClose: () => void;
  onAddToCart: () => void;
  onOrder: () => void;
}

export const FittingResultView = memo(function FittingResultView({
  fittingImageUrl,
  fittingProduct,
  onClose,
  onAddToCart,
  onOrder,
}: FittingResultViewProps) {
  return (
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
          onClick={onClose}
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
          src={fittingImageUrl}
          alt="Fitting result"
          className="max-h-full max-w-full rounded-2xl object-contain"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        />
      </div>

      {/* Product Info & Actions */}
      <motion.div
        className="p-4 pb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mx-auto max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-wider text-white/50">
            {fittingProduct.brand_name}
          </p>
          <h3
            className="mt-1 cursor-pointer font-medium text-white hover:underline"
            onClick={() => {
              const url = fittingProduct.product_url;
              if (url) window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            {fittingProduct.product_name}
          </h3>
          <p className="mt-1 font-bold text-white">
            {fittingProduct.selling_price?.toLocaleString()}
          </p>

          <div className="mt-4 flex gap-2">
            <motion.button
              onClick={() => {
                haptic('tap');
                onAddToCart();
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
                onOrder();
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
    </motion.div>
  );
});
