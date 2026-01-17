import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useOrderDetail, useOrderCancel } from '../hooks/useOrders';

const statusLabels: Record<string, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  PREPARING: '상품준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-800',
  PAID: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  SHIPPING: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
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

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-background/90 sticky top-0 z-sticky w-full border-b border-black/5 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">주문 상세</h2>
            {order && (
              <p className="mt-1 text-[9px] text-black/40">주문번호: {order.order_id}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-black/30" />
            <p className="mt-4 text-[12px] text-black/40">주문 정보를 불러오는 중...</p>
          </div>
        ) : error || !order ? (
          <EmptyState
            icon={<Package size={48} strokeWidth={1} />}
            title="주문을 찾을 수 없습니다"
            description="주문 정보를 불러올 수 없습니다"
            action={
              <Button variant="outline" onClick={() => navigate('/orders')}>
                목록으로 돌아가기
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-4xl border border-black/5 bg-white p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">
                주문 정보
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[12px] text-black/60">주문일시</span>
                  <span className="text-[12px] font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-black/60">배송지</span>
                  <span className="text-[12px] font-medium">{order.delivery_address || '-'}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3">
                  <span className="text-[12px] font-bold">총 결제금액</span>
                  <span className="text-[14px] font-black">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="animate-in fade-in slide-in-from-bottom-2 delay-100 rounded-4xl border border-black/5 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">
                  주문 상품 ({order.order_items.length}개)
                </h3>
              </div>
              <div className="divide-y divide-black/5">
                {order.order_items.map((item) => (
                  <div key={item.order_item_id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[13px] font-bold">{item.product_name}</p>
                        <p className="mt-1 text-[11px] text-black/40">
                          수량: {item.purchased_quantity}개
                        </p>
                        <p className="mt-1 text-[12px] font-medium">
                          {formatPrice(item.price_at_order)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${
                          statusColors[item.order_status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[item.order_status] || item.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="animate-in fade-in slide-in-from-bottom-2 delay-200 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-[11px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                주문 취소
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
