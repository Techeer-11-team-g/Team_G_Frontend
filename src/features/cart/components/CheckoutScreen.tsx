import { useState } from 'react';
import { CheckoutHeader } from './CheckoutHeader';
import { CartItemList } from './CartItemList';
import { AddressCard } from './AddressCard';
import { PaymentMethodCard } from './PaymentMethodCard';
import { OrderSummary } from './OrderSummary';
import { CheckoutFooter } from './CheckoutFooter';
import type { ProductCandidate } from '@/types/api';

interface CheckoutScreenProps {
  items: ProductCandidate[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onComplete: () => void;
}

export function CheckoutScreen({ items, onClose, onComplete }: CheckoutScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());

  const toggleExclude = (index: number) => {
    const newExcluded = new Set(excludedIndices);
    if (newExcluded.has(index)) {
      newExcluded.delete(index);
    } else {
      newExcluded.add(index);
    }
    setExcludedIndices(newExcluded);
  };

  const activeItems = items.filter((_, i) => !excludedIndices.has(i));

  const calculateTotal = () => {
    return activeItems.reduce((acc, item) => {
      const num = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      return acc + num;
    }, 0);
  };

  const handleCheckout = () => {
    if (activeItems.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
      alert('주문이 성공적으로 완료되었습니다. 아틀리에가 준비를 시작합니다.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[700] bg-background flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <CheckoutHeader onClose={onClose} />

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
        <section className="space-y-6">
          <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-black/20">
            Selected Artifacts
          </h3>
          <CartItemList
            items={items}
            excludedIndices={excludedIndices}
            onToggleItem={toggleExclude}
          />
        </section>

        <section className="grid grid-cols-1 gap-6">
          <AddressCard
            address="서울특별시 강남구 아틀리에로 123, 502호"
            onEdit={() => {
              /* TODO: Open address edit modal */
            }}
          />
          <PaymentMethodCard
            cardType="VISA"
            cardInfo="신한카드 (42**)"
            onEdit={() => {
              /* TODO: Open payment edit modal */
            }}
          />
        </section>

        <OrderSummary subtotal={calculateTotal()} deliveryEstimate="2-3 Days" />
      </main>

      <CheckoutFooter
        isProcessing={isProcessing}
        disabled={activeItems.length === 0}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
