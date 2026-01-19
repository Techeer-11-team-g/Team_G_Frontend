import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../hooks';
import { useOrderCreate } from '@/features/orders';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BottomNavigation, PageHeader } from '@/components/layout';

export function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalQuantity, isLoading, removeFromCart, isRemoving } = useCart();
  const { user } = useAuthStore();
  const orderMutation = useOrderCreate();

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user?.user_id) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

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
      toast.error('주문에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-black/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title="장바구니" subtitle={`${totalQuantity}개 상품`} showBack />

      <main className="mx-auto max-w-md px-6 py-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} strokeWidth={1} />}
            title="장바구니가 비어있습니다"
            description="마음에 드는 상품을 담아보세요"
            action={
              <Button onClick={() => navigate('/home')}>
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
                  key={item.cart_item_id}
                  className="animate-in fade-in slide-in-from-bottom-2 flex gap-4 rounded-3xl border border-black/5 bg-white p-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-black/5">
                    <img
                      src={item.product_details.main_image_url}
                      alt={item.product_details.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-black/40">
                        {item.product_details.brand_name}
                      </p>
                      <h4 className="mt-1 line-clamp-2 text-[13px] font-bold">
                        {item.product_details.product_name}
                      </h4>
                      {item.product_details.size && (
                        <p className="mt-1 text-[11px] text-black/50">
                          사이즈: {item.product_details.size}
                        </p>
                      )}
                    </div>
                    <p className="text-[14px] font-black">
                      {formatPrice(item.product_details.selling_price)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
                    disabled={isRemoving}
                    className="flex h-8 w-8 items-center justify-center self-start rounded-full bg-black/5 text-black/30 transition-all hover:bg-black hover:text-white disabled:opacity-50"
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
                  <span className="font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-black/50">배송비</span>
                  <span className="font-bold text-accent">무료</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3">
                  <span className="text-[13px] font-bold">총 결제금액</span>
                  <span className="text-[16px] font-black">{formatPrice(totalPrice)}</span>
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
            <Button
              className="h-14 w-full"
              onClick={handleCheckout}
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  주문 처리 중...
                </>
              ) : (
                `${formatPrice(totalPrice)} 결제하기`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={totalQuantity} />
    </div>
  );
}
