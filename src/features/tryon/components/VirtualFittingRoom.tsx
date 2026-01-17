import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { useTryOnMutation, useTryOnStatus, useTryOnResult } from '../hooks/useTryOn';
import { FittingHeader } from './FittingHeader';
import { FittingPreview } from './FittingPreview';
import { ProductBrief } from './ProductBrief';
import { FittingFooter } from './FittingFooter';
import { useUserStore } from '@/store';
import type { ProductCandidate } from '@/types/api';

interface VirtualFittingRoomProps {
  product: ProductCandidate;
  onClose: () => void;
  onAddToCart: (product: ProductCandidate) => void;
}

export function VirtualFittingRoom({
  product,
  onClose,
  onAddToCart,
}: VirtualFittingRoomProps) {
  const navigate = useNavigate();
  const { userImageUrl } = useUserStore();
  const [viewMode, setViewMode] = useState<'before' | 'after'>('after');
  const [fittingImageId, setFittingImageId] = useState<number | null>(null);

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
      statusData?.fitting_image_status !== 'FAILED');

  const fittingResult = tryOnResult?.fitting_image_url || null;

  // 피팅 완료 시 after 모드로 전환
  useEffect(() => {
    if (fittingResult) {
      setViewMode('after');
      toast.success('가상 피팅이 완료되었습니다', {
        description: '결과를 확인해보세요',
      });
    }
  }, [fittingResult]);

  // 에러 처리
  useEffect(() => {
    if (statusData?.fitting_image_status === 'FAILED') {
      toast.error('피팅 처리 중 오류가 발생했습니다');
    }
  }, [statusData?.fitting_image_status]);

  const handleStartFitting = async () => {
    if (!userImageUrl) return;
    setFittingImageId(null);

    try {
      const result = await tryOnMutation.mutateAsync({
        product_id: product.product_id || 0,
        user_image_url: userImageUrl,
      });
      setFittingImageId(result.fitting_image_id);
    } catch (err) {
      console.error('Fitting request failed:', err);
      toast.error('피팅 요청에 실패했습니다');
    }
  };

  const handleGoToProfile = () => {
    onClose();
    navigate('/profile');
  };

  const statusMessage =
    statusData?.fitting_image_status === 'RUNNING'
      ? '원단을 체형에 재구성하고 있습니다'
      : '서버 연결 중';

  // 전신 사진이 없는 경우
  if (!userImageUrl) {
    return (
      <div className="fixed inset-0 z-[600] bg-background flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        <FittingHeader onClose={onClose} />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto">
              <User size={40} className="text-black/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">전신 사진이 필요해요</h3>
              <p className="text-[13px] text-black/50">
                가상 피팅을 이용하려면 먼저 마이페이지에서 전신 사진을 등록해주세요.
              </p>
            </div>
            <button
              onClick={handleGoToProfile}
              className="px-8 py-4 bg-black text-white rounded-2xl text-[12px] uppercase font-black tracking-widest hover:bg-black/80 transition-colors"
            >
              마이페이지로 이동
            </button>
          </div>
        </main>
      </div>
    );
  }

  const showStartButton = !fittingResult && !isGenerating;
  const showRetryOptions = !!fittingResult;

  return (
    <div className="fixed inset-0 z-[600] bg-background flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <FittingHeader onClose={onClose} />

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
        <FittingPreview
          userPhoto={userImageUrl}
          fittingResult={fittingResult}
          viewMode={viewMode}
          isGenerating={isGenerating}
          statusMessage={statusMessage}
          onViewModeChange={setViewMode}
        />

        <ProductBrief
          product={product}
          showStartButton={showStartButton}
          showRetryOptions={showRetryOptions}
          onStartFitting={handleStartFitting}
          onTryOther={onClose}
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
