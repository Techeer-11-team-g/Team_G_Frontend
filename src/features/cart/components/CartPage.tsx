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
      <header className="bg-background/90 sticky top-0 z-sticky w-full border-b border-black/5 px-6 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">장바구니</h2>
            <p className="mt-1 text-[9px] text-black/40">{items.length}개 상품</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] font-black uppercase text-black/40 transition-colors hover:text-black"
            >
              전체 삭제
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} strokeWidth={1} />}
            title="장바구니가 비어있습니다"
            description="마음에 드는 상품을 담아보세요"
            action={
              <Button variant="outline" onClick={() => navigate('/home')}>
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
                  className="animate-in fade-in slide-in-from-bottom-2 flex gap-4 rounded-3xl border border-black/5 bg-white p-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-black/5">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-black/40">
                        {item.brand}
                      </p>
                      <h4 className="mt-1 line-clamp-2 text-[13px] font-bold">{item.name}</h4>
                    </div>
                    <p className="text-[14px] font-black">{item.price}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center self-start rounded-full bg-black/5 text-black/30 transition-all hover:bg-black hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4 rounded-4xl border border-black/5 bg-white p-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20">
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
                <div className="flex justify-between border-t border-black/5 pt-3">
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
        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-6">
          <div className="mx-auto max-w-md">
            <Button className="h-14 w-full" onClick={handleCheckout} disabled={isProcessing}>
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
