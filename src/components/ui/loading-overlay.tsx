import { LoadingSpinner } from './loading-spinner';

interface LoadingOverlayProps {
  title?: string;
  message?: string;
}

export function LoadingOverlay({
  title = 'Loading...',
  message,
}: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
      <LoadingSpinner size="lg" />
      <div className="text-center space-y-2">
        <p className="font-serif text-3xl italic opacity-40">{title}</p>
        {message && (
          <p className="text-[9px] uppercase font-black text-black/30 tracking-widest">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

