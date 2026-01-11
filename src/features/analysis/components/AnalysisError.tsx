import { ErrorState } from '@/components/ui';

interface AnalysisErrorProps {
  message: string;
  onRetry: () => void;
}

export function AnalysisError({ message, onRetry }: AnalysisErrorProps) {
  return (
    <ErrorState
      title="분석 중단"
      message={message}
      onRetry={onRetry}
      retryLabel="다시 시도"
    />
  );
}
