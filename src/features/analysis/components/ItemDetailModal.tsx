import { cn } from '@/utils/cn';
import type { AnalyzedItem, ProductCandidate } from '@/types/api';

interface ItemDetailModalProps {
  item: AnalyzedItem;
  onClose: () => void;
  onAddToCart: (product: ProductCandidate) => void;
  onStartFitting: (product: ProductCandidate) => void;
}

export function ItemDetailModal({
  item,
  onClose,
  onAddToCart,
  onStartFitting,
}: ItemDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 px-6 py-6 bg-background/90 backdrop-blur-xl border-b border-black/5 flex justify-between items-center z-30">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-black/20">
            {item.category}
          </span>
          <h2 className="font-serif text-3xl font-bold">{item.label}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <div className="px-6 py-10 space-y-12 pb-32">
        <section className="space-y-4">
          <p className="font-serif text-xl italic text-black/60 leading-relaxed">
            "{item.description}"
          </p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-black text-white text-[9px] uppercase font-black rounded-full">
              {item.aesthetic}
            </span>
          </div>
        </section>

        <section className="space-y-6">
          <h6 className="text-[10px] uppercase font-black tracking-widest text-black/20">
            Item Matches
          </h6>
          {item.candidates.map((candidate, index) => (
            <CandidateCard
              key={index}
              candidate={candidate}
              onAddToCart={() => onAddToCart(candidate)}
              onStartFitting={() => onStartFitting(candidate)}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

interface CandidateCardProps {
  candidate: ProductCandidate;
  onAddToCart: () => void;
  onStartFitting: () => void;
}

function CandidateCard({ candidate, onAddToCart, onStartFitting }: CandidateCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-6 relative overflow-hidden">
      <div
        className={cn(
          'absolute top-0 right-0 px-4 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest',
          candidate.match_type === 'Exact'
            ? 'bg-amber-100 text-amber-900'
            : 'bg-gray-100 text-gray-500'
        )}
      >
        {candidate.match_type}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-black text-black/30 tracking-widest">
          {candidate.brand}
        </p>
        <h6 className="text-[17px] font-bold">{candidate.name}</h6>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-black/5">
        <span className="text-[15px] font-mono font-bold">{candidate.price}</span>
        <div className="flex gap-2">
          {candidate.source_url && (
            <a
              href={candidate.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black/5 text-black text-[9px] uppercase font-black rounded-xl"
            >
              Shop
            </a>
          )}
          <button
            onClick={onAddToCart}
            className="px-4 py-2 bg-black text-white text-[9px] uppercase font-black rounded-xl"
          >
            + Cart
          </button>
          <button
            onClick={onStartFitting}
            className="px-4 py-2 bg-accent text-white text-[9px] uppercase font-black rounded-xl"
          >
            Fitting
          </button>
        </div>
      </div>
    </div>
  );
}

