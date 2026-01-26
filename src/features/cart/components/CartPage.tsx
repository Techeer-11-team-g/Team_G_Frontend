import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from 'framer-motion';
import { ArrowLeft, ShoppingBag, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../hooks';
import { useOrderCreate } from '@/features/orders';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/cn';
import { haptic, easings, springs, durations, presets } from '@/motion';
import { glassTw } from '@/styles/liquid-glass';
import { MainHeader } from '@/components/layout';

// Cart item type from hook
type CartItemType = ReturnType<typeof useCart>['items'][number];

// 3D Tilt Card Component
function CartItemCard({
  item,
  index,
  onRemove,
  isRemoving,
  formatPrice,
  layoutId,
}: {
  item: CartItemType;
  index: number;
  onRemove: (id: number) => void;
  isRemoving: boolean;
  formatPrice: (price: number) => string;
  layoutId: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // 3D tilt values
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Swipe opacity and background
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const deleteOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - centerY) / centerY) * -6;
    const rotateY = ((mouseX - centerX) / centerX) * 6;

    setTilt({ rotateX, rotateY });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);

    // Swipe threshold for delete
    if (info.offset.x < -100 || info.velocity.x < -500) {
      haptic('error');
      onRemove(item.cart_item_id);
    }
  };

  return (
    <motion.div
      className="relative"
      layoutId={layoutId}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: -300,
        scale: 0.8,
        transition: { duration: 0.3, ease: easings.exit }
      }}
      transition={{
        delay: index * durations.stagger,
        ...springs.gentle
      }}
    >
      {/* Delete indicator background */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-red-500/20 flex items-center justify-end pr-6"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 className="w-5 h-5 text-red-400" />
      </motion.div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        className={cn(
          'relative flex gap-4 p-4 rounded-2xl cursor-grab active:cursor-grabbing',
          glassTw.card,
          'transition-shadow duration-300'
        )}
        style={{
          x,
          opacity,
          scale,
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileTap={{ scale: 0.98 }}
      >
        {/* Product Image */}
        <motion.div
          className="w-20 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0"
          style={{ transform: 'translateZ(20px)' }}
        >
          <img
            src={item.product_details.main_image_url}
            alt={item.product_details.product_name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>

        {/* Product Info */}
        <div
          className="flex-1 flex flex-col justify-between py-1"
          style={{ transform: 'translateZ(10px)' }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-light">
              {item.product_details.brand_name}
            </p>
            <h4 className="text-sm font-light tracking-wide line-clamp-2 mt-1 text-white/90">
              {item.product_details.product_name}
            </h4>
            {item.product_details.size && (
              <p className="text-[11px] text-white/30 mt-1.5 tracking-wider">
                Size {item.product_details.size}
              </p>
            )}
          </div>
          <p className="text-sm font-light tracking-wide text-white">
            {formatPrice(item.product_details.selling_price)}
          </p>
        </div>

        {/* Remove Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            haptic('tap');
            onRemove(item.cart_item_id);
          }}
          disabled={isRemoving}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center self-start',
            'bg-white/[0.04] border border-white/[0.08]',
            'text-white/30 hover:text-white/70 hover:bg-white/[0.08] hover:border-white/[0.15]',
            'transition-all duration-200 disabled:opacity-30'
          )}
          style={{ transform: 'translateZ(30px)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={14} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, totalQuantity, isLoading, removeFromCart, isRemoving } = useCart();
  const { user } = useAuthStore();
  const orderMutation = useOrderCreate();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}`;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user?.user_id) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    haptic('purchase');

    try {
      const cartItemIds = items.map((item) => item.cart_item_id);
      await orderMutation.mutateAsync({
        cart_item_ids: cartItemIds,
        payment_method: 'card',
        user_id: user.user_id,
      });
      toast.success('주문이 완료되었습니다');
      navigate('/orders');
    } catch {
      haptic('error');
      toast.error('주문에 실패했습니다');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          {...presets.fadeUp}
        >
          <motion.div
            className={cn(
              'w-12 h-12 rounded-full',
              glassTw.orb
            )}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <p className="text-xs tracking-[0.2em] uppercase text-white/40">Loading</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Main Header */}
      <MainHeader />

      {/* Sub Header - Glassmorphism */}
      <motion.header
        className={cn(
          'fixed top-14 left-0 right-0 z-40 px-6 py-4',
          'bg-black/60 backdrop-blur-xl border-b border-white/[0.06]'
        )}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.button
            onClick={() => {
              haptic('tap');
              const from = (location.state as { from?: string } | null)?.from;
              from ? navigate(from) : navigate(-1);
            }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 -ml-3 rounded-full',
              'text-xs tracking-[0.1em] uppercase text-white/60',
              'hover:text-white hover:bg-white/[0.05]',
              'transition-all duration-200'
            )}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            <span className="font-light">Back</span>
          </motion.button>

          <motion.div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              glassTw.subtle
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, ...springs.gentle }}
          >
            <ShoppingBag size={12} className="text-white/40" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-white/50 font-light">
              {totalQuantity} items
            </span>
          </motion.div>
        </div>
      </motion.header>

      <main className="relative pt-32 pb-36 px-6">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              // Empty State
              <motion.div
                key="empty"
                className="min-h-[60vh] flex flex-col items-center justify-center text-center"
                {...presets.fadeUp}
              >
                <motion.div
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center mb-8',
                    glassTw.medium
                  )}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ShoppingBag size={28} className="text-white/30" strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-xl font-light tracking-wide mb-3">
                  Your cart is empty
                </h2>
                <p className="text-sm text-white/40 mb-10 font-light tracking-wide leading-relaxed">
                  Discover something you love
                </p>

                <motion.button
                  onClick={() => {
                    haptic('tap');
                    navigate('/home');
                  }}
                  className={cn(
                    'group flex items-center gap-3 px-8 py-4 rounded-full',
                    glassTw.button,
                    'text-sm tracking-[0.1em] uppercase font-light'
                  )}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={14} className="text-white/50" />
                  <span>Start Shopping</span>
                  <ArrowUpRight
                    size={14}
                    className="text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </motion.button>
              </motion.div>
            ) : (
              // Cart Items
              <motion.div
                key="items"
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easings.smooth }}
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-light">
                    Shopping Cart
                  </p>
                  <h1 className="text-3xl font-extralight tracking-tight">
                    {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
                  </h1>
                </motion.div>

                {/* Swipe Hint */}
                <motion.p
                  className="text-[10px] tracking-[0.15em] uppercase text-white/20 font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Swipe left to remove
                </motion.p>

                {/* Cart Items List */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <CartItemCard
                        key={item.cart_item_id}
                        layoutId={`cart-item-${item.cart_item_id}`}
                        item={item}
                        index={index}
                        onRemove={removeFromCart}
                        isRemoving={isRemoving}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order Summary - Glassmorphism */}
                <motion.div
                  className={cn(
                    'p-6 rounded-2xl space-y-5',
                    glassTw.medium
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: items.length * durations.stagger + 0.2, ...springs.gentle }}
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-light">
                    Order Summary
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/40 font-light tracking-wide">
                        Subtotal
                      </span>
                      <span className="text-sm font-light tracking-wide">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/40 font-light tracking-wide">
                        Shipping
                      </span>
                      <span className="text-sm text-emerald-400/80 font-light tracking-wider">
                        FREE
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-wide">Total</span>
                    <span className="text-xl font-light tracking-wide">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Checkout Button - Fixed Bottom */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ ...springs.snappy }}
          >
            <div className="max-w-md mx-auto">
              <motion.button
                onClick={handleCheckout}
                disabled={orderMutation.isPending}
                className={cn(
                  'group relative w-full py-5 rounded-2xl overflow-hidden',
                  'flex items-center justify-center gap-3',
                  'transition-all duration-300',
                  !orderMutation.isPending
                    ? 'bg-white text-black hover:bg-white/95'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                )}
                whileHover={!orderMutation.isPending ? { scale: 1.01, y: -2 } : {}}
                whileTap={!orderMutation.isPending ? { scale: 0.98 } : {}}
              >
                {/* Shine effect */}
                {!orderMutation.isPending && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                )}

                {orderMutation.isPending ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <span className="text-sm tracking-[0.1em] uppercase font-medium">
                      Checkout
                    </span>
                    <span className="text-sm font-light">
                      {formatPrice(totalPrice)}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </>
                )}
              </motion.button>

              {/* Safe area padding for mobile */}
              <div className="h-safe-area-inset-bottom" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
