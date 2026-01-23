import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AgentMessage } from '../agent';
import { HeroProductCard } from './HeroProductCard';
import { ProductCard } from './ProductCard';
import type { ProductCandidate } from '@/types/api';

interface ResultCanvasProps {
  agentMessage?: string;
  heroProduct?: ProductCandidate;
  alternativeProducts?: ProductCandidate[];
  onProductSelect?: (product: ProductCandidate) => void;
  onTryOn?: (product: ProductCandidate) => void;
  onAddToCart?: (productId: number) => void;
  onBuyNow?: (productId: number) => void;
  className?: string;
}

export function ResultCanvas({
  agentMessage = '이런 스타일은 어떠세요?',
  heroProduct,
  alternativeProducts = [],
  onProductSelect,
  onTryOn,
  onAddToCart,
  onBuyNow,
  className,
}: ResultCanvasProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Agent Message */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AgentMessage message={agentMessage} />
      </motion.div>

      {/* Hero Product */}
      <AnimatePresence>
        {heroProduct && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-accent">
                BEST MATCH
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
            </div>
            <HeroProductCard
              product={heroProduct}
              onSelect={() => onProductSelect?.(heroProduct)}
              onTryOn={() => onTryOn?.(heroProduct)}
              onAddToCart={() => heroProduct.product_id && onAddToCart?.(heroProduct.product_id)}
              onBuyNow={() => heroProduct.product_id && onBuyNow?.(heroProduct.product_id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alternative Products */}
      {alternativeProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider text-white/40">
              ALTERNATIVES
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {alternativeProducts.map((product, i) => (
              <motion.div
                key={product.product_id ?? i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard
                  product={product}
                  index={i + 1}
                  onSelect={() => onProductSelect?.(product)}
                  onTryOn={() => onTryOn?.(product)}
                  onAddToCart={() => product.product_id && onAddToCart?.(product.product_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
