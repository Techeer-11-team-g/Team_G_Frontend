import { cn } from '@/utils/cn';
import { FittingStatus } from './FittingStatus';
import { ViewModeToggle } from './ViewModeToggle';

interface FittingPreviewProps {
  userPhoto: string;
  fittingResult: string | null;
  viewMode: 'before' | 'after';
  isGenerating: boolean;
  statusMessage: string;
  onViewModeChange: (mode: 'before' | 'after') => void;
}

export function FittingPreview({
  userPhoto,
  fittingResult,
  viewMode,
  isGenerating,
  statusMessage,
  onViewModeChange,
}: FittingPreviewProps) {
  const displayImage = viewMode === 'before' || !fittingResult ? userPhoto : fittingResult;

  return (
    <div className="relative aspect-[3/4] w-full bg-black/5 rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
      <div className="w-full h-full relative flex items-center justify-center bg-black/5">
        <img
          src={displayImage}
          alt="피팅 결과"
          className={cn(
            'max-w-full max-h-full object-contain transition-all duration-700',
            isGenerating ? 'opacity-30 blur-sm grayscale' : 'opacity-100'
          )}
        />

        {fittingResult && !isGenerating && (
          <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
        )}

        {isGenerating && <FittingStatus message={statusMessage} />}
      </div>
    </div>
  );
}

