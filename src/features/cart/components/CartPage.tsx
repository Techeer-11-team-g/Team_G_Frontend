import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BottomNavigation } from '@/components/layout';

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
      return acc + num * item.quantity;
    }, 0);
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      alert('주문이 성공적으로 완료되었습니다.');
      navigate('/orders');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 w-full px-6 py-6 z-sticky bg-background/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.4em] font-black">장바구니</h2>
            <p className="text-[9px] text-black/40 mt-1">{items.length}개 상품</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] font-black uppercase text-black/40 hover:text-black transition-colors"
            >
              전체 삭제
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} strokeWidth={1} />}
            title="장바구니가 비어있습니다"
            description="마음에 드는 상품을 담아보세요"
            action={
              <Button variant="outline" onClick={() => navigate('/')}>
                쇼핑하러 가기
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-black/5 p-4 flex gap-4 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-black/40 font-medium">
                        {item.brand}
                      </p>
                      <h4 className="text-[13px] font-bold mt-1 line-clamp-2">{item.name}</h4>
                    </div>
                    <p className="text-[14px] font-black">{item.price}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/30 hover:bg-black hover:text-white transition-all self-start"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-4xl border border-black/5 p-6 space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-black/20">
                주문 요약
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-black/50">상품 금액</span>
                  <span className="font-bold">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-black/50">배송비</span>
                  <span className="font-bold text-accent">무료</span>
                </div>
                <div className="border-t border-black/5 pt-3 flex justify-between">
                  <span className="text-[13px] font-bold">총 결제금액</span>
                  <span className="text-[16px] font-black">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Button - Fixed at bottom */}
      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-md mx-auto">
            <Button
              className="w-full h-14"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : `${formatPrice(calculateTotal())} 결제하기`}
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={items.length} />
    </div>
  );
}
