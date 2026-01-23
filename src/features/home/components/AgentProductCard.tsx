import { useState, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { easings } from '@/motion';
import type { ProductCandidate } from '@/types/api';

export interface AgentProductCardProps {
  product: ProductCandidate;
  index: number;
  onTryOn: () => void;
  onAddToCart: (size?: string, quantity?: number) => void;
  onBuy: (size?: string, quantity?: number) => void;
  isProcessing: boolean;
}

export const AgentProductCard = memo(function AgentProductCard({
  product,
  index,
  onTryOn,
  onAddToCart,
  onBuy,
  isProcessing,
}: AgentProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  // Get available sizes - handle both string[] and object[] formats
  const availableSizes = useMemo(
    () =>
      product.sizes
        ?.map((s) => {
          if (typeof s === 'string') return s;
          return (
            (s as { size?: string; size_value?: string }).size ||
            (s as { size?: string; size_value?: string }).size_value ||
            ''
          );
        })
        .filter(Boolean) || [],
    [product.sizes]
  );

  // 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <motion.article
      ref={cardRef}
      className="group cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.9 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', damping: 20, stiffness: 100 },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        touchAction: 'pan-y',
      }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: hovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Card Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: hovered
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Glass reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ touchAction: 'pan-y' }}>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
          <motion.img
            src={product.image_url || product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0, pointerEvents: 'none' }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: easings.smooth }}
          />

          {/* Gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />

          {/* Match Score Badge */}
          {product.similarity_score !== undefined && (
            <motion.div
              className="absolute left-3 top-3 rounded-full px-2.5 py-1"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] font-medium tabular-nums text-white/80">
                {Math.round(product.similarity_score * 100)}% 일치
              </span>
            </motion.div>
          )}

          {/* Index Number Badge */}
          <motion.div
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-xs font-semibold text-white">{index}</span>
          </motion.div>

          {/* Actions on hover */}
          <motion.div
            className="absolute inset-x-3 bottom-3 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onTryOn();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-medium text-white"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={12} />
              Try on
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                if (availableSizes.length > 0 && !selectedSize) {
                  setShowSizeSelector(true);
                } else {
                  onAddToCart(selectedSize || undefined, quantity);
                }
              }}
              className="flex-1 rounded-xl py-2.5 text-[11px] font-medium text-white"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedSize ? `담기 (${selectedSize})` : '담기'}
            </motion.button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-white/40">
            {product.brand || '브랜드'}
          </p>
          <h3
            className="mb-2 line-clamp-1 cursor-pointer text-sm font-medium text-white/90 transition-colors hover:text-white hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              const url = product.source_url || (product as { product_url?: string }).product_url;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {product.name}
          </h3>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-white/50">사이즈</span>
                {selectedSize && <span className="text-[10px] text-white/70">{selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSizes.slice(0, 5).map((size) => (
                  <motion.button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(selectedSize === size ? null : size);
                    }}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
                {availableSizes.length > 5 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSizeSelector(true);
                    }}
                    className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium text-white/70 hover:bg-white/20"
                    whileTap={{ scale: 0.95 }}
                  >
                    +{availableSizes.length - 5}
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] text-white/50">수량</span>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20"
                whileTap={{ scale: 0.9 }}
              >
                -
              </motion.button>
              <span className="w-6 text-center text-xs tabular-nums text-white">{quantity}</span>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => Math.min(10, q + 1));
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20"
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {typeof product.price === 'number'
                ? `₩${(product.price * quantity).toLocaleString()}`
                : product.price}
            </span>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onBuy(selectedSize || undefined, quantity);
              }}
              disabled={isProcessing || (availableSizes.length > 0 && !selectedSize)}
              className={`text-[11px] font-medium transition-colors ${
                availableSizes.length > 0 && !selectedSize
                  ? 'cursor-not-allowed text-white/30'
                  : 'text-white/50 hover:text-white'
              }`}
              whileHover={availableSizes.length === 0 || selectedSize ? { x: 2 } : {}}
            >
              {isProcessing ? '...' : '바로 구매 →'}
            </motion.button>
          </div>
        </div>

        {/* Full Size Selector Modal */}
        <AnimatePresence>
          {showSizeSelector && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col bg-black/90 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowSizeSelector(false);
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-white">사이즈 선택</span>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizeSelector(false);
                  }}
                  className="text-white/50 hover:text-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="flex flex-1 flex-wrap content-start gap-2">
                {availableSizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                      setShowSizeSelector(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
});
