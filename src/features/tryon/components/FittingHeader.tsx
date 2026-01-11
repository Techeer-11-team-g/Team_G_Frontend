import { ModalHeader } from '@/components/ui';

interface FittingHeaderProps {
  onClose: () => void;
}

export function FittingHeader({ onClose }: FittingHeaderProps) {
  return (
    <ModalHeader
      title="Virtual Fitting"
      subtitle="Atelier Fitting v2"
      onClose={onClose}
    />
  );
}
