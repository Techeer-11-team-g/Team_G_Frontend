import { LoadingOverlay } from '@/components/ui';

interface FittingStatusProps {
  message: string;
}

export function FittingStatus({ message }: FittingStatusProps) {
  return <LoadingOverlay title="Fitting..." message={message} />;
}
