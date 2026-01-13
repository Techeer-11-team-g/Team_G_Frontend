import type { LocalHistoryItem } from '@/types/local';

interface HistoryArchiveProps {
  history: LocalHistoryItem[];
  onSelectItem: (item: LocalHistoryItem) => void;
}

export function HistoryArchive({ history, onSelectItem }: HistoryArchiveProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">
          Archive History
        </h4>
        <span className="font-mono text-[10px] opacity-20">[{history.length}/5]</span>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-6">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group h-32 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white bg-white shadow-lg transition-all active:scale-95"
          >
            <img
              src={item.image}
              alt="히스토리"
              className="h-full w-full object-cover opacity-40 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
            />
          </div>
        ))}
        {history.length === 0 && (
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
