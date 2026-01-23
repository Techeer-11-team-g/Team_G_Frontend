import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import type { ChatProduct } from '@/types/api';

interface ProductBottomSheetProps {
  products: ChatProduct[];
  selectedProductId: number | null;
  selectedProduct: ChatProduct | undefined;
  onProductSelect: (productId: number) => void;
  onTryOn: (product: ChatProduct) => void;
  onAddToCart: (index: number) => void;
  onDismiss: () => void;
}

export function ProductBottomSheet({
  products,
  selectedProductId,
  selectedProduct,
  onProductSelect,
  onTryOn,
  onAddToCart,
  onDismiss,
}: ProductBottomSheetProps) {
  return (
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
          onDismiss();
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
                {selectedProduct.selling_price.toLocaleString()}
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
                onProductSelect(product.product_id);
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
