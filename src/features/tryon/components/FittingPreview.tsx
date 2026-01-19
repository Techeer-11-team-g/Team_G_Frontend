import { cn } from '@/utils/cn';
import { FittingStatus } from './FittingStatus';
import { SegmentedControl } from '@/components/ui';

interface FittingPreviewProps {
  userPhoto: string;
  fittingResult: string | null;
  viewMode: 'before' | 'after';
  isGenerating: boolean;
  statusMessage: string;
  onViewModeChange: (mode: 'before' | 'after') => void;
}

const VIEW_OPTIONS = ['before', 'after'] as const;

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
    <div className="space-y-4">
      {/* 이미지 프리뷰 */}
      <div className="relative w-full flex justify-center">
        <div className="relative">
          <img
            src={displayImage}
            alt="피팅 결과"
            className={cn(
              'max-w-full max-h-[50vh] object-contain rounded-3xl transition-all duration-700',
              isGenerating ? 'opacity-30 blur-sm grayscale' : 'opacity-100'
            )}
          />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FittingStatus message={statusMessage} />
            </div>
          )}
        </div>
      </div>

      {/* Before/After 토글 - 이미지 아래에 배치 */}
      {fittingResult && !isGenerating && (
        <div className="flex justify-center">
          <SegmentedControl
            options={VIEW_OPTIONS}
            value={viewMode}
            onChange={onViewModeChange}
          />
        </div>
      )}
    </div>
  );
}

