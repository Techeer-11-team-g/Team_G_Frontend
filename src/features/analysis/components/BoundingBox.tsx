import { cn } from '@/utils/cn';

interface BoundingBoxProps {
  label: string;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  isActive: boolean;
  onClick: () => void;
}

export function BoundingBox({ label, box, isActive, onClick }: BoundingBoxProps) {
  const [x1, y1, x2, y2] = box;

  return (
    <div
      style={{
        top: `${y1 * 100}%`,
        left: `${x1 * 100}%`,
        width: `${(x2 - x1) * 100}%`,
        height: `${(y2 - y1) * 100}%`,
        pointerEvents: 'auto',
      }}
      onClick={onClick}
      className={cn(
        'absolute border-2 rounded-xl transition-all duration-500 cursor-pointer',
        isActive
          ? 'border-white bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.5)] scale-105'
          : 'border-white/30 hover:border-white/60'
      )}
    >
      {isActive && (
        <div className="absolute -top-10 left-0 bg-white text-black text-[9px] px-3 py-1.5 font-black rounded-lg uppercase shadow-xl animate-in fade-in zoom-in">
          {label}
        </div>
      )}
    </div>
  );
}

