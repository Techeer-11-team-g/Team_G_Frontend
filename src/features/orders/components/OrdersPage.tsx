import { useState, useEffect } from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout';
import { useCartStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    name: string;
    brand: string;
    price: string;
    image: string;
  }[];
  total: string;
}

const statusLabels: Record<Order['status'], string> = {
  processing: '처리중',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨',
};

const statusColors: Record<Order['status'], string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const { items: cartItems } = useCartStore();

  useEffect(() => {
    // Load orders from localStorage (mock data)
    const saved = localStorage.getItem('whats_on_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 w-full px-6 py-6 z-sticky bg-background/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-md mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black">주문 내역</h2>
          <p className="text-[9px] text-black/40 mt-1">{orders.length}개의 주문</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Package size={48} strokeWidth={1} />}
            title="주문 내역이 없습니다"
            description="첫 주문을 해보세요"
            action={
              <Button variant="outline" onClick={() => navigate('/')}>
                쇼핑하러 가기
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-4xl border border-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-black/40 font-medium">
                      {order.date}
                    </p>
                    <p className="text-[11px] font-bold mt-1">주문번호: {order.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white bg-black/5"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-xl bg-black/5 border-2 border-white flex items-center justify-center">
                          <span className="text-[10px] font-black text-black/40">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium line-clamp-1">
                        {order.items[0].name}
                        {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                      </p>
                      <p className="text-[14px] font-black mt-1">{order.total}</p>
                    </div>
                    <ChevronRight size={18} className="text-black/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartItems.length} />
    </div>
  );
}
