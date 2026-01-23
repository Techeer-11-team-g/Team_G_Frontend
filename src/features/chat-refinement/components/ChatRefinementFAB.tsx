import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/utils/cn';

interface ChatRefinementFABProps {
  onClick: () => void;
  isVisible: boolean;
}

export function ChatRefinementFAB({ onClick, isVisible }: ChatRefinementFABProps) {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowBubble(false);
      return;
    }

    // 5초 후 말풍선 표시
    const showTimer = setTimeout(() => {
      setShowBubble(true);
    }, 5000);

    // 8초 후 (5초 + 3초) 말풍선 숨김
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-32 right-6 z-50',
        'animate-in fade-in slide-in-from-right-4 duration-500'
      )}
    >
      {/* 말풍선 */}
      {showBubble && (
        <div
          onClick={onClick}
          className={cn(
            'absolute -left-40 top-1/2 -translate-y-1/2 cursor-pointer',
            'bg-white px-4 py-2.5 rounded-2xl shadow-lg',
            'text-[12px] font-bold text-black/80 whitespace-nowrap',
            'hover:scale-105 active:scale-95 transition-transform',
            'animate-in fade-in slide-in-from-right-2 duration-300'
          )}
        >
          상품이 마음에 안드시나요?
          {/* 말풍선 꼬리 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-3 h-3 bg-white rotate-45 shadow-lg" />
        </div>
      )}

      {/* Lottie 버튼 */}
      <div
        onClick={onClick}
        className={cn(
          'cursor-pointer',
          'w-14 h-14 rounded-full overflow-hidden',
          'shadow-2xl shadow-black/30',
          'active:scale-95 transition-all'
        )}
        role="button"
        aria-label="AI 스타일리스트 열기"
      >
        <div className="w-full h-full pointer-events-none scale-150">
          <DotLottieReact
            src="/ai-agent.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
