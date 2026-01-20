import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { springs } from '@/motion';
import type { ProductCandidate, ProductSize } from '@/types/api';

interface ProductCardProps {
  product: ProductCandidate;
  label?: string;
  animationDelay?: number;
  onAddToCart?: (selectedProductId: number) => void;
  onBuyNow?: (selectedProductId: number) => void;
  onStartFitting?: () => void;
  showActions?: boolean;
  isProcessing?: boolean;
  isHighlighted?: boolean;
}

// sizes가 문자열 배열인지 ProductSize 배열인지 확인
function isStringSizeArray(sizes: ProductSize[] | string[]): sizes is string[] {
  return sizes.length > 0 && typeof sizes[0] === 'string';
}

export function ProductCard({
  product,
  label,
  animationDelay = 0,
  onAddToCart,
  onBuyNow,
  onStartFitting,
  showActions = true,
  isProcessing = false,
  isHighlighted = false,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const canExpand = showActions && (onAddToCart || onBuyNow || onStartFitting);
  const isStringSize = hasSizes && isStringSizeArray(product.sizes!);

  const handleSizeSelect = (index: number) => {
    setSelectedSizeIndex(index);
  };

  // 사이즈 선택 또는 product_id 반환
  const getProductIdForAction = () => {
    // 사이즈가 없으면 product_id 직접 사용
    if (!hasSizes && product.product_id) return product.product_id;

    // 문자열 사이즈면 product_id 사용 (사이즈 선택 필요)
    if (isStringSize && selectedSizeIndex !== null && product.product_id) {
      return product.product_id;
    }

    // ProductSize 배열이면 selected_product_id 사용
    if (!isStringSize && selectedSizeIndex !== null && product.sizes) {
      const size = product.sizes[selectedSizeIndex] as ProductSize;
      return size.selected_product_id;
    }

    return null;
  };

  const handleAddToCart = () => {
    const productId = getProductIdForAction();
    if (productId && onAddToCart) {
      onAddToCart(productId);
    }
  };

  const handleBuyNow = () => {
    const productId = getProductIdForAction();
    if (productId && onBuyNow) {
      onBuyNow(productId);
    }
  };

  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-2xl transition-all')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay / 1000, ...springs.gentle }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isHighlighted
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isHighlighted
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isHighlighted
          ? '0 0 30px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255,255,255,0.1)'
          : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Glass reflection overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          borderRadius: 'inherit',
        }}
      />

      {/* Liquid shine animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: 'inherit' }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ borderRadius: 'inherit' }}
          animate={{
            background: [
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 50%, transparent 55%)',
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 55%, transparent 60%)',
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 50%, transparent 55%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 p-4">
        {label && <CategoryBadge category={label} />}

        {/* 메인 영역 - 클릭하면 확장 */}
        <div
          className={cn('flex gap-4', canExpand && 'cursor-pointer')}
          onClick={() => canExpand && setIsExpanded(!isExpanded)}
        >
          {/* Product Image */}
          {product.image && (
            <motion.div
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl"
              whileHover={{ scale: 1.05 }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {/* Image glass overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)',
                }}
              />
            </motion.div>
          )}

          {/* Product Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
              {product.brand}
            </p>
            {product.source_url ? (
              <a
                href={product.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block truncate pr-8 text-[13px] font-bold tracking-tight text-white/90 hover:text-white transition-colors"
              >
                {product.name}
              </a>
            ) : (
              <h6 className="truncate pr-8 text-[13px] font-bold tracking-tight text-white/90">
                {product.name}
              </h6>
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-white">{product.price}</span>
              {canExpand && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-white/40" />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* 확장 영역 - 사이즈 선택 & 구매 */}
        <AnimatePresence>
          {isExpanded && canExpand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springs.snappy}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                {/* 사이즈 선택 (사이즈가 있을 때만) */}
                {hasSizes && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes!.map((size, index) => {
                        const isSelected = selectedSizeIndex === index;

                        // 문자열 사이즈
                        if (typeof size === 'string') {
                          return (
                            <GlassSizeButton
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSizeSelect(index);
                              }}
                              isSelected={isSelected}
                            >
                              {size}
                            </GlassSizeButton>
                          );
                        }

                        // ProductSize 객체
                        const isOutOfStock = size.inventory === 0;
                        const isSelectable = !isOutOfStock && size.selected_product_id !== null;

                        return (
                          <GlassSizeButton
                            key={size.size_code_id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelectable) {
                                handleSizeSelect(index);
                              }
                            }}
                            disabled={!isSelectable}
                            isSelected={isSelected}
                          >
                            {size.size_value}
                          </GlassSizeButton>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {onAddToCart && (
                    <GlassActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                      }}
                      disabled={!getProductIdForAction() || isProcessing}
                      variant="secondary"
                    >
                      <ShoppingBag size={12} />
                      <span>Add</span>
                    </GlassActionButton>
                  )}
                  {onBuyNow && (
                    <GlassActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow();
                      }}
                      disabled={!getProductIdForAction() || isProcessing}
                      variant="primary"
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <span>Buy Now</span>
                        </>
                      )}
                    </GlassActionButton>
                  )}
                  {onStartFitting && (
                    <GlassActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFitting();
                      }}
                      variant="accent"
                    >
                      <Sparkles size={12} />
                      <span>Try On</span>
                    </GlassActionButton>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <div
      className="absolute right-0 top-0 z-20 rounded-bl-xl py-1.5 px-3 text-[8px] font-black uppercase tracking-widest text-white/70"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none',
        borderRight: 'none',
      }}
    >
      {category}
    </div>
  );
}

// Glass Size Button Component - Monochrome
function GlassSizeButton({
  children,
  onClick,
  disabled,
  isSelected,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  isSelected?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={cn(
        'relative rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all overflow-hidden',
        disabled && 'cursor-not-allowed opacity-40 line-through'
      )}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
          : 'rgba(255, 255, 255, 0.06)',
        border: isSelected
          ? '1px solid rgba(255, 255, 255, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
        boxShadow: isSelected
          ? '0 0 15px rgba(255, 255, 255, 0.15), inset 0 1px 1px rgba(255,255,255,0.2)'
          : 'inset 0 1px 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* Glass reflection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
          borderRadius: 'inherit',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// Glass Action Button Component - Monochrome
function GlassActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
}) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
      border: '1px solid rgba(255,255,255,0.25)',
      color: 'white',
      hoverGlow: 'rgba(255,255,255,0.15)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.8)',
      hoverGlow: 'rgba(255,255,255,0.1)',
    },
    accent: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      color: 'white',
      hoverGlow: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const style = styles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, boxShadow: `0 0 20px ${style.hoverGlow}` } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        'relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all overflow-hidden',
        disabled && 'cursor-not-allowed opacity-40'
      )}
      style={{
        background: disabled ? 'rgba(255,255,255,0.03)' : style.background,
        border: style.border,
        color: style.color,
        backdropFilter: 'blur(8px)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* Glass reflection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          borderRadius: 'inherit',
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
