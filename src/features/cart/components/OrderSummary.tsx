interface OrderSummaryProps {
  subtotal: number;
  curationFee?: number;
  deliveryEstimate: string;
}

export function OrderSummary({
  subtotal,
  curationFee = 0,
  deliveryEstimate,
}: OrderSummaryProps) {
  const total = subtotal + curationFee;

  return (
    <section className="bg-white p-8 rounded-5xl border border-black/5 shadow-lg space-y-4">
      <div className="flex justify-between text-[12px]">
        <span className="text-black/40">Subtotal</span>
        <span className="font-mono font-bold">₩{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-[12px]">
        <span className="text-black/40">Curation Fee</span>
        <span className="font-mono font-bold">₩{curationFee.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-[12px]">
        <span className="text-black/40">Expected Delivery</span>
        <span className="font-bold text-accent">{deliveryEstimate}</span>
      </div>
      <div className="pt-4 border-t border-black/5 flex justify-between items-center">
        <span className="text-[10px] uppercase font-black tracking-[0.4em]">Total Amount</span>
        <span className="text-[20px] font-mono font-black">₩{total.toLocaleString()}</span>
      </div>
    </section>
  );
}

