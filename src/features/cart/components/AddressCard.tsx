import { InfoCard } from '@/components/ui';

interface AddressCardProps {
  address: string;
  onEdit: () => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  return (
    <InfoCard label="Delivery Address" onEdit={onEdit}>
      <p className="text-[13px] font-medium">{address}</p>
    </InfoCard>
  );
}
