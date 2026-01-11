import { cn } from '@/utils/cn';
import type { ProductCandidate } from '@/types/api';

interface CartItemCardProps {
  item: ProductCandidate;
  isExcluded: boolean;
  onToggle: () => void;
}

export function CartItemCard({ item, isExcluded, onToggle }: CartItemCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-5 rounded-[1.8rem] border transition-all',
        isExcluded ? 'opacity-40 bg-black/5 border-transparent' : 'bg-white border-black/5 shadow-sm'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center border transition-all',
          isExcluded ? 'border-black/20 bg-white' : 'bg-black border-black text-white'
        )}
      >
        {!isExcluded && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <div className="flex-1 space-y-1">
        <p className="text-[9px] uppercase font-black text-accent/50">{item.brand}</p>
        <h4 className="text-[14px] font-bold truncate pr-4">{item.name}</h4>
      </div>
      <div className="text-right">
        <span className="text-[14px] font-mono font-bold">{item.price}</span>
      </div>
    </div>
  );
}

