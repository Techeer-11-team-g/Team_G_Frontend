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
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, onLoadMore]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">
          History
        </h4>
        <span className="font-mono text-[10px] opacity-20">{history.length}</span>
      </div>

      {isLoading ? (
        // 초기 로딩 스켈레톤
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-black/5 animate-pulse" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-0.5">
            {history.map((item) => (
              <div
                key={item.uploaded_image_id}
                onClick={() => onSelectItem(item)}
                className="group aspect-[3/4] cursor-pointer overflow-hidden transition-all active:opacity-70"
              >
                <img
                  src={item.uploaded_image_url}
                  alt="히스토리"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
          {/* 무한 스크롤 트리거 */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingMore && (
                <Loader2 size={20} className="animate-spin text-black/20" />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-10">
            분석 기록이 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
