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
      className="bg-white p-4 rounded-3xl border border-black/5 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-10 duration-700"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <MatchTypeBadge type={product.match_type} />

      <div className="flex gap-4">
        {/* Product Image - 작은 썸네일 */}
        {product.image && (
          <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-black/5">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[9px] uppercase font-black text-black/30 tracking-widest">
            {label ? `${label} • ` : ''}{product.brand}
          </p>
          <h6 className="text-[13px] font-bold tracking-tight truncate pr-8">{product.name}</h6>
          <span className="text-[13px] font-mono font-bold">{product.price}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-black/5">
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="flex-1 py-2.5 bg-black text-white text-[9px] uppercase font-black tracking-widest rounded-xl active:scale-95 transition-all"
            >
              + Cart
            </button>
          )}
          {onStartFitting && (
            <button
              onClick={onStartFitting}
              className="flex-1 py-2.5 bg-accent text-white text-[9px] uppercase font-black tracking-widest rounded-xl active:scale-95 transition-all"
            >
              Fitting
            </button>
          )}
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-black/5 text-black text-[9px] uppercase font-black tracking-widest rounded-xl flex items-center justify-center"
            >
              Shop
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MatchTypeBadge({ type }: { type: string }) {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 px-3 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest',
        type === 'Exact' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-500'
      )}
    >
      {type}
    </div>
  );
}
