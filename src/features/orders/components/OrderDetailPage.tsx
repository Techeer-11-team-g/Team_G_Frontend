import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MainHeader } from '@/components/layout';
import { useOrderDetail, useOrderCancel } from '../hooks/useOrders';
import { haptic, easings, springs } from '@/motion';

const statusLabels: Record<string, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  PREPARING: '상품준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PREPARING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  SHIPPING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number): string {
  return `₩${price.toLocaleString()}`;
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const orderIdNum = orderId ? parseInt(orderId, 10) : null;

  const { data: order, isLoading, error } = useOrderDetail(orderIdNum);
  const cancelMutation = useOrderCancel();

  const handleCancel = async () => {
    if (!orderIdNum) return;

    if (!confirm('주문을 취소하시겠습니까?')) return;

    try {
      await cancelMutation.mutateAsync(orderIdNum);
      toast.success('주문이 취소되었습니다');
      navigate('/orders');
    } catch {
      toast.error('주문 취소에 실패했습니다');
    }
  };

  // 취소 가능 여부 (PENDING, PAID 상태만)
  const canCancel =
    order?.order_items.some(
      (item) => item.order_status === 'PENDING' || item.order_status === 'PAID'
    ) ?? false;

  // Loading State
  if (isLoading) {
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
          <motion.div
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
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

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white">
        <MainHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <motion.div
            className="w-20 h-20 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Package size={28} className="text-white/30" strokeWidth={1} />
          </motion.div>
          <h2 className="text-xl font-extralight tracking-wide text-white mb-2">
            주문을 찾을 수 없습니다
          </h2>
          <p className="text-sm font-light text-white/40 mb-8">
            주문 정보를 불러올 수 없습니다
          </p>
          <motion.button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 rounded-full border border-white/[0.12] bg-white/[0.02] text-sm font-light text-white/80"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            목록으로 돌아가기
          </motion.button>
        </div>
      </div>
    );
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
              navigate('/orders');
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
            <span className="text-[11px] tracking-wide text-white/50 font-light">
              주문번호 {order.order_id}
            </span>
          </motion.div>
        </div>
      </motion.header>

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Page Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easings.smooth }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light mb-3">
              Order Details
            </p>
            <h1 className="text-3xl font-extralight tracking-tight text-white">
              주문 상세
            </h1>
          </motion.div>

          {/* Order Info Card */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-5">
                주문 정보
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-white/50 font-light">주문일시</span>
                  <span className="text-[12px] font-light text-white/80">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-white/50 font-light">배송지</span>
                  <span className="text-[12px] font-light text-white/80">{order.delivery_address || '-'}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-white/70">총 결제금액</span>
                  <span className="text-xl font-extralight tracking-tight text-white">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Items Card */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                  주문 상품 ({order.order_items.length}개)
                </h3>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {order.order_items.map((item, index) => (
                  <motion.div
                    key={item.order_item_id}
                    className="px-6 py-5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white/90 truncate">
                          {item.product_name}
                        </p>
                        <p className="mt-1.5 text-[11px] text-white/40 font-light">
                          수량: {item.purchased_quantity}개
                        </p>
                        <p className="mt-1 text-[13px] font-light text-white/70">
                          {formatPrice(item.price_at_order)}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-3 py-1 text-[9px] font-medium uppercase tracking-wider border ${
                          statusColors[item.order_status] || 'bg-white/10 text-white/60 border-white/20'
                        }`}
                      >
                        {statusLabels[item.order_status] || item.order_status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cancel Button */}
          {canCancel && (
            <motion.button
              onClick={() => {
                haptic('tap');
                handleCancel();
              }}
              disabled={cancelMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-4 text-[11px] font-medium uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {cancelMutation.isPending ? (
                <motion.div
                  className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <XCircle size={14} />
              )}
              주문 취소
            </motion.button>
          )}
        </div>
      </main>

      {/* Glass Footer */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 px-6 py-5 border-t border-white/[0.05] bg-black/60 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between text-[10px] font-light tracking-[0.15em] uppercase text-white/20 max-w-lg mx-auto">
          <span>2025</span>
          <span className="text-white/30">Dressense</span>
        </div>
      </motion.footer>
    </div>
  );
}
