import { useState, useRef, useEffect } from 'react';
import { useTryOnMutation, useTryOnStatus, useTryOnResult } from '../hooks/useTryOn';
import { FittingHeader } from './FittingHeader';
import { FittingPreview } from './FittingPreview';
import { ProductBrief } from './ProductBrief';
import { FittingFooter } from './FittingFooter';
import type { ProductCandidate } from '@/types/api';

interface VirtualFittingRoomProps {
  product: ProductCandidate;
  userPhoto: string | null;
  onClose: () => void;
  onSaveUserPhoto: (photo: string) => void;
  onAddToCart: (product: ProductCandidate) => void;
  detectedObjectId?: number;
}

export function VirtualFittingRoom({
  product,
  userPhoto,
  onClose,
  onSaveUserPhoto,
  onAddToCart,
  detectedObjectId = 0,
}: VirtualFittingRoomProps) {
  const [viewMode, setViewMode] = useState<'before' | 'after'>('after');
  const [fittingImageId, setFittingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TryOn API hooks
  const tryOnMutation = useTryOnMutation();
  const { data: statusData } = useTryOnStatus(
    fittingImageId,
    !!fittingImageId && tryOnMutation.isSuccess
  );
  const { data: tryOnResult } = useTryOnResult(
    fittingImageId,
    statusData?.fitting_image_status === 'DONE'
  );

  const isGenerating =
    tryOnMutation.isPending ||
    (!!fittingImageId &&
      statusData?.fitting_image_status !== 'DONE' &&
      statusData?.fitting_image_status !== 'ERROR');

  const fittingResult = tryOnResult?.fitting_image_url || null;

  // 피팅 완료 시 after 모드로 전환
  useEffect(() => {
    if (fittingResult) {
      setViewMode('after');
    }
  }, [fittingResult]);

  const handleStartFitting = async () => {
    if (!userPhoto) return;
    setFittingImageId(null);

    try {
      const result = await tryOnMutation.mutateAsync({
        detected_object_id: detectedObjectId,
        product_id: product.product_id || 0,
        user_image_url: userPhoto,
      });
      setFittingImageId(result.fitting_image_id);
    } catch (err) {
      console.error('Fitting request failed:', err);
    }
  };

  const statusMessage =
    statusData?.fitting_image_status === 'RUNNING'
      ? '원단을 체형에 재구성하고 있습니다'
      : '서버 연결 중';

  const showStartButton = !fittingResult && !!userPhoto && !isGenerating;
  const showRetryOptions = !!fittingResult;

  return (
    <div className="fixed inset-0 z-[600] bg-background flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <FittingHeader onClose={onClose} />

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
        <FittingPreview
          userPhoto={userPhoto}
          fittingResult={fittingResult}
          viewMode={viewMode}
          isGenerating={isGenerating}
          statusMessage={statusMessage}
          onUploadPhoto={onSaveUserPhoto}
          onViewModeChange={setViewMode}
        />

        <ProductBrief
          product={product}
          showStartButton={showStartButton}
          showRetryOptions={showRetryOptions}
          onStartFitting={handleStartFitting}
          onTryOther={onClose}
          onRetakePhoto={() => fileInputRef.current?.click()}
        />

        {/* Hidden file input for retake */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => onSaveUserPhoto(event.target?.result as string);
              reader.readAsDataURL(file);
            }
          }}
        />
      </main>

      <FittingFooter
        product={product}
        onAddToCart={() => onAddToCart(product)}
        onCheckout={() => {
          /* TODO: Navigate to checkout */
        }}
      />
    </div>
  );
}
