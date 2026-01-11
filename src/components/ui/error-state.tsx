interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = '오류 발생',
  message,
  onRetry,
  retryLabel = '다시 시도',
}: ErrorStateProps) {
  return (
    <div className="text-center py-20 px-6 space-y-6">
      <h3 className="font-serif text-3xl italic text-rose-950">{title}</h3>
      <p className="text-[11px] text-rose-900/40 uppercase font-black">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-5 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-2xl"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

