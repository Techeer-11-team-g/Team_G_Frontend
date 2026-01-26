import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { haptic, easings, springs, containerVariants, itemVariants } from '@/motion';
import { MainHeader } from '@/components/layout';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(price: number): string {
  return `${price.toLocaleString()}`;
}

// Status badge with breathing animation
function StatusBadge({ status }: { status?: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '처리중', color: 'bg-white/20' },
    processing: { label: '준비중', color: 'bg-white/30' },
    shipped: { label: '배송중', color: 'bg-white/40' },
    delivered: { label: '배송완료', color: 'bg-white/60' },
    cancelled: { label: '취소됨', color: 'bg-white/10' },
  };

  const config = statusConfig[status || 'pending'] || statusConfig.pending;

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${config.color} text-black`}
      animate={{
        opacity: [0.7, 1, 0.7],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-black/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {config.label}
    </motion.span>
  );
}

// Glass card component for orders
function OrderCard({
  order,
  onClick,
}: {
  order: {
    order_id: number;
    created_at: string;
    total_price: number;
  };
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={() => {
        haptic('tap');
        onClick();
      }}
      className="w-full group"
      variants={itemVariants}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springs.snappy}
    >
      {/* Glass Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/[0.12]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-light">
                {formatDate(order.created_at)}
              </p>
              <p className="text-[11px] tracking-wide text-white/50 font-light">
                주문번호 {order.order_id}
              </p>
            </div>
            <StatusBadge />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">
                Total
              </p>
              <p className="text-xl font-extralight tracking-tight text-white">
                {formatPrice(order.total_price)}
              </p>
            </div>
            <motion.div
              className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center"
              whileHover={{ scale: 1.1, borderColor: 'rgba(255,255,255,0.2)' }}
              transition={springs.snappy}
            >
              <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
            </motion.div>
          </div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
          }}
        />
      </div>
    </motion.button>
  );
}

// Empty state component
function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: easings.smooth }}
    >
      {/* Glass icon container */}
      <motion.div
        className="w-20 h-20 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl flex items-center justify-center mb-8"
        animate={{
          scale: [1, 1.03, 1],
          borderColor: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Package size={28} className="text-white/30" strokeWidth={1} />
      </motion.div>

      <h2 className="text-xl font-extralight tracking-wide text-white mb-2">
        주문 내역이 없습니다
      </h2>
      <p className="text-sm font-light tracking-wide text-white/40 mb-10 max-w-[240px]">
        AI 에이전트와 함께 새로운 스타일을 발견해보세요
      </p>

      <motion.button
        onClick={() => {
          haptic('tap');
          onNavigate();
        }}
        className="group relative overflow-hidden px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springs.snappy}
      >
        <span className="relative z-10 flex items-center gap-3 text-sm font-light tracking-wider text-white/80">
          <span>스타일 탐색 시작</span>
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
          />
        </span>
        {/* Hover fill effect */}
        <motion.div
          className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </motion.button>
    </motion.div>
  );
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl flex items-center justify-center mb-8"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Package size={28} className="text-white/30" strokeWidth={1} />
      </motion.div>

      <h2 className="text-xl font-extralight tracking-wide text-white mb-2">
        불러올 수 없습니다
      </h2>
      <p className="text-sm font-light tracking-wide text-white/40 mb-10">
        잠시 후 다시 시도해주세요
      </p>

      <motion.button
        onClick={() => {
          haptic('tap');
          onRetry();
        }}
        className="px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-xl text-sm font-light tracking-wider text-white/80"
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)' }}
        whileTap={{ scale: 0.98 }}
        transition={springs.snappy}
      >
        다시 시도
      </motion.button>
    </motion.div>
  );
}

// Loading state with breathing animation
function LoadingState() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.div
        className="relative w-16 h-16"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-white/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute inset-6 rounded-full bg-white/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error } = useOrders();

  const orders = data?.orders ?? [];

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Main Header */}
      <MainHeader />

      {/* Sub Header */}
      <motion.header
        className="fixed top-14 left-0 right-0 z-40 px-6 py-4 border-b border-white/[0.05] bg-black/60 backdrop-blur-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <motion.button
            onClick={() => {
              haptic('tap');
              const from = (location.state as { from?: string } | null)?.from;
              from ? navigate(from) : navigate(-1);
            }}
            className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span className="text-xs font-light tracking-[0.15em] uppercase">Back</span>
          </motion.button>

          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, ...springs.gentle }}
          >
            <Package size={12} className="text-white/40" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-white/50 font-light">
              {orders.length} orders
            </span>
          </motion.div>
        </div>
      </motion.header>

      <main className="pt-36 pb-16 px-6">
        <div className="max-w-lg mx-auto">
          {/* Page Title */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easings.smooth }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light mb-3">
              {orders.length > 0 ? `${orders.length} Orders` : 'No Orders'}
            </p>
            <h1 className="text-3xl font-extralight tracking-tight text-white">
              주문 내역
            </h1>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {error ? (
              <ErrorState key="error" onRetry={() => window.location.reload()} />
            ) : orders.length === 0 ? (
              <EmptyState key="empty" onNavigate={() => navigate('/home')} />
            ) : (
              <motion.div
                key="orders"
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {orders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onClick={() => navigate(`/orders/${order.order_id}`)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Glass Footer */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 px-6 py-5 border-t border-white/[0.05] bg-black/60 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between text-[10px] font-light tracking-[0.15em] uppercase text-white/20 max-w-lg mx-auto">
          <span>2025</span>
          <span className="text-white/30">Dressense</span>
        </div>
      </motion.footer>
    </div>
  );
}
