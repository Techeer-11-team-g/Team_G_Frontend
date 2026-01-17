import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout';
import { useCartStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(price: number): string {
  return `₩${price.toLocaleString()}`;
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const { data, isLoading, error } = useOrders();

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-background/90 sticky top-0 z-sticky w-full border-b border-black/5 px-6 py-6 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">주문 내역</h2>
          <p className="mt-1 text-[9px] text-black/40">
            {isLoading ? '로딩 중...' : `${orders.length}개의 주문`}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-black/30" />
            <p className="mt-4 text-[12px] text-black/40">주문 내역을 불러오는 중...</p>
          </div>
        ) : error ? (
          <EmptyState
            icon={<Package size={48} strokeWidth={1} />}
            title="주문 내역을 불러올 수 없습니다"
            description="잠시 후 다시 시도해주세요"
            action={
              <Button variant="outline" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            }
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package size={48} strokeWidth={1} />}
            title="주문 내역이 없습니다"
            description="첫 주문을 해보세요"
            action={
              <Button variant="outline" onClick={() => navigate('/home')}>
                쇼핑하러 가기
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <button
                key={order.order_id}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="animate-in fade-in slide-in-from-bottom-2 w-full overflow-hidden rounded-4xl border border-black/5 bg-white text-left transition-colors hover:bg-black/[0.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                  <div>
                    <p className="text-[10px] font-medium text-black/40">
                      {formatDate(order.created_at)}
                    </p>
                    <p className="mt-1 text-[11px] font-bold">주문번호: {order.order_id}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-black">{formatPrice(order.total_price)}</p>
                    <ChevronRight size={18} className="text-black/20" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartItems.length} />
    </div>
  );
}
