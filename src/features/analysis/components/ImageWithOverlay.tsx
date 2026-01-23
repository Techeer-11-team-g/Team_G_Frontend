import { BoundingBox } from './BoundingBox';
import type { AnalyzedItem } from '@/types/api';

interface ImageWithOverlayProps {
  image: string;
  items: AnalyzedItem[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
}

export function ImageWithOverlay({
  image,
  items,
  selectedIndex,
  onSelectItem,
}: ImageWithOverlayProps) {
  return (
    <div className="relative w-full">
      <div className="bg-white p-2 shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-5xl border border-white overflow-hidden">
        <div className="relative">
          <img src={image} className="w-full rounded-[1.8rem]" alt="분석 이미지" />
          <div className="absolute inset-0 pointer-events-none">
          {items.map((item, idx) => (
              <BoundingBox
                key={item.id}
                label={item.label}
                box={item.box_2d}
                isActive={selectedIndex === idx}
                onClick={() => onSelectItem(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

