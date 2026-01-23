import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import type { ChatProduct } from '@/types/api';

interface ProductSidePanelProps {
  products: ChatProduct[];
  selectedProductId: number | null;
  hoveredProductId: number | null;
  onProductSelect: (productId: number) => void;
  onProductHover: (productId: number | null) => void;
  onTryOn: (product: ChatProduct) => void;
  onAddToCart: (index: number) => void;
}

export function ProductSidePanel({
  products,
  selectedProductId,
  hoveredProductId,
  onProductSelect,
  onProductHover,
  onTryOn,
  onAddToCart,
}: ProductSidePanelProps) {
  return (
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
                      {product.selling_price.toLocaleString()}
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
  );
}
