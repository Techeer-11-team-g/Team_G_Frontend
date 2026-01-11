import { cn } from '@/utils/cn';
import { UserPhotoUpload } from './UserPhotoUpload';
import { FittingStatus } from './FittingStatus';
import { ViewModeToggle } from './ViewModeToggle';

interface FittingPreviewProps {
  userPhoto: string | null;
  fittingResult: string | null;
  viewMode: 'before' | 'after';
  isGenerating: boolean;
  statusMessage: string;
  onUploadPhoto: (photo: string) => void;
  onViewModeChange: (mode: 'before' | 'after') => void;
}

export function FittingPreview({
  userPhoto,
  fittingResult,
  viewMode,
  isGenerating,
  statusMessage,
  onUploadPhoto,
  onViewModeChange,
}: FittingPreviewProps) {
  const displayImage = viewMode === 'before' || !fittingResult ? userPhoto : fittingResult;

  return (
    <div className="relative aspect-[3/4] w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
      {!userPhoto ? (
        <UserPhotoUpload onUpload={onUploadPhoto} />
      ) : (
        <div className="w-full h-full relative">
          <img
            src={displayImage!}
            alt="피팅 결과"
            className={cn(
              'w-full h-full object-cover transition-all duration-1000',
              isGenerating ? 'opacity-30 blur-sm grayscale' : 'opacity-100'
            )}
          />

          {fittingResult && !isGenerating && (
            <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
          )}

          {isGenerating && <FittingStatus message={statusMessage} />}
        </div>
      )}
    </div>
  );
}

