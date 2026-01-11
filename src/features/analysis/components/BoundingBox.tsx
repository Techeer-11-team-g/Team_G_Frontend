import { cn } from '@/utils/cn';

interface BoundingBoxProps {
  label: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  isActive: boolean;
  onClick: () => void;
}

export function BoundingBox({ label, box, isActive, onClick }: BoundingBoxProps) {
  const [ymin, xmin, ymax, xmax] = box;

  return (
    <div
      style={{
        top: `${ymin / 10}%`,
        left: `${xmin / 10}%`,
        width: `${(xmax - xmin) / 10}%`,
        height: `${(ymax - ymin) / 10}%`,
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

