import { InfoCard } from '@/components/ui';

interface PaymentMethodCardProps {
  cardType: string;
  cardInfo: string;
  onEdit: () => void;
}

export function PaymentMethodCard({ cardType, cardInfo, onEdit }: PaymentMethodCardProps) {
  return (
    <InfoCard label="Payment Method" onEdit={onEdit}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-[8px] text-white font-black italic">
          {cardType}
        </div>
        <p className="text-[13px] font-medium">{cardInfo}</p>
      </div>
    </InfoCard>
  );
}
