interface AnalyzingStateProps {
  status?: string;
}

export function AnalyzingState({ status }: AnalyzingStateProps) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-10 animate-in fade-in">
      <div className="font-serif text-5xl italic opacity-10 text-black animate-pulse">
        Analyzing...
      </div>
      <div className="w-40 h-[1px] bg-black/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-black w-1/3 animate-shimmer" />
      </div>
      <p className="text-[10px] uppercase tracking-widest font-black text-black/20">
        {status === 'processing' ? '이미지 분석 중' : '서버 연결 중'}
      </p>
    </div>
  );
}
