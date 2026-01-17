import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { UploadedImage } from '@/types/api';

interface HistoryArchiveProps {
  history: UploadedImage[];
  onSelectItem: (item: UploadedImage) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
}

export function HistoryArchive({
  history,
  onSelectItem,
  isLoading,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: HistoryArchiveProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 스크롤 끝 감지
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          onLoadMore();
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, onLoadMore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">
          Archive History
        </h4>
        <span className="font-mono text-[10px] opacity-20">[{history.length}]</span>
      </div>
      <div ref={scrollRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-6">
        {isLoading ? (
          // 초기 로딩 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-24 flex-shrink-0 rounded-2xl bg-black/5 animate-pulse"
            />
          ))
        ) : history.length > 0 ? (
          <>
            {history.map((item) => (
              <div
                key={item.uploaded_image_id}
                onClick={() => onSelectItem(item)}
                className="group h-32 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white bg-white shadow-lg transition-all active:scale-95"
              >
                <img
                  src={item.uploaded_image_url}
                  alt="히스토리"
                  className="h-full w-full object-cover opacity-40 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            ))}
            {/* 무한 스크롤 트리거 */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="h-32 w-24 flex-shrink-0 flex items-center justify-center"
              >
                {isFetchingMore && (
                  <Loader2 size={20} className="animate-spin text-black/20" />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-black/10 py-12">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-10">
              분석 기록이 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
