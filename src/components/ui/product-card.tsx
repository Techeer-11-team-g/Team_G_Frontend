import { cn } from '@/utils/cn';
import type { ProductCandidate } from '@/types/api';

interface ProductCardProps {
  product: ProductCandidate;
  label?: string;
  animationDelay?: number;
  onAddToCart?: () => void;
  onStartFitting?: () => void;
  showActions?: boolean;
}

export function ProductCard({
  product,
  label,
  animationDelay = 0,
  onAddToCart,
  onStartFitting,
  showActions = true,
}: ProductCardProps) {
  return (
    <div
      className="bg-white p-6 rounded-4xl border border-black/5 shadow-sm space-y-6 relative overflow-hidden animate-in slide-in-from-bottom-10 duration-700"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <MatchTypeBadge type={product.match_type} />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[9px] uppercase font-black text-black/20 tracking-widest">
            {label ? `${label} • ` : ''}{product.brand}
          </p>
          <h6 className="text-[16px] font-bold tracking-tight pr-12">{product.name}</h6>
        </div>
        <span className="text-[14px] font-mono font-bold whitespace-nowrap">{product.price}</span>
      </div>

      {showActions && (
        <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
          <div className="flex gap-2">
            {onAddToCart && (
              <button
                onClick={onAddToCart}
                className="flex-1 py-3 bg-black text-white text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
              >
                + Cart
              </button>
            )}
            {onStartFitting && (
              <button
                onClick={onStartFitting}
                className="flex-1 py-3 bg-accent text-white text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
              >
                Fitting
              </button>
            )}
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-black/5 text-black text-[10px] uppercase font-black tracking-widest rounded-xl flex items-center justify-center"
            >
              Shop
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchTypeBadge({ type }: { type: string }) {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 px-4 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest',
        type === 'Exact' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-500'
      )}
    >
      {type} Match
    </div>
  );
}

