import { ModalHeader } from '@/components/ui';

interface CheckoutHeaderProps {
  onClose: () => void;
}

export function CheckoutHeader({ onClose }: CheckoutHeaderProps) {
  return (
    <ModalHeader
      title="Checkout"
      subtitle="Cart & Billing"
      onClose={onClose}
    />
  );
}
