import { lazy, Suspense } from 'react';

// Lazy load Lottie component - only loads when AnalyzingState is rendered
const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact }))
);

interface AnalyzingStateProps {
  status?: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | null;
  progress?: number;
}

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: '서버 연결 중',
  RUNNING: '이미지 분석 중',
  DONE: '분석 완료',
  ERROR: '분석 실패',
};

// Simple loading fallback for Lottie
function LottieFallback() {
  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-black/10 border-t-black/30 animate-spin" />
    </div>
  );
}

export function AnalyzingState({ status, progress = 0 }: AnalyzingStateProps) {
  const message = status ? STATUS_MESSAGES[status] : '준비 중';
  const displayProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in">
      {/* Lottie Animation - Lazy loaded */}
      <div className="w-48 h-48">
        <Suspense fallback={<LottieFallback />}>
          <DotLottieReact
            src="/Cosmos.lottie"
            loop
            autoplay
          />
        </Suspense>
      </div>

      {/* Progress Bar */}
      <div className="w-48 space-y-2">
        <div className="h-[2px] bg-black/5 relative overflow-hidden rounded-full">
          {progress > 0 ? (
            <div
              className="absolute inset-y-0 left-0 bg-accent transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          ) : (
            <div className="absolute inset-0 bg-black/20 w-1/3 animate-shimmer" />
          )}
        </div>
        {progress > 0 && (
          <p className="text-center text-[10px] font-mono text-black/30">
            {displayProgress}%
          </p>
        )}
      </div>

      <p className="text-[10px] uppercase tracking-widest font-black text-black/20">
        {message}
      </p>
    </div>
  );
}
