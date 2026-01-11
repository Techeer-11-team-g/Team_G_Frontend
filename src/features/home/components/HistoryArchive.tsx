import type { HistoryItem } from '@/types/api';

interface HistoryArchiveProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export function HistoryArchive({ history, onSelectItem }: HistoryArchiveProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-black/5 pb-4">
        <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/20">
          Archive History
        </h4>
        <span className="text-[10px] font-mono opacity-20">[{history.length}/05]</span>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="w-24 h-32 flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg border border-white active:scale-95 transition-all cursor-pointer group"
          >
            <img
              src={item.image}
              alt="히스토리"
              className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
        ))}
        {history.length === 0 && (
          <div className="w-full py-12 border border-dashed border-black/10 rounded-2xl flex items-center justify-center">
            <p className="text-[10px] uppercase font-black opacity-10 tracking-widest">
              분석 기록이 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
