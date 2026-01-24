import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { useTryOnMutation, useTryOnStatus, useTryOnResult } from '../hooks/useTryOn';
import { FittingHeader } from './FittingHeader';
import { FittingPreview } from './FittingPreview';
import { ProductBrief } from './ProductBrief';
import { FittingFooter } from './FittingFooter';
import { useUserStore } from '@/store';
import { AgentOrb } from '@/components/agent';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import type { ProductCandidate } from '@/types/api';

interface VirtualFittingRoomProps {
  product: ProductCandidate;
  onClose: () => void;
  onAddToCart: (selectedProductId: number) => void;
  onBuyNow: (selectedProductId: number) => void;
}

export function VirtualFittingRoom({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: VirtualFittingRoomProps) {
  const navigate = useNavigate();
  const { userImageUrl } = useUserStore();
  const [viewMode, setViewMode] = useState<'before' | 'after'>('after');
  const [fittingImageId, setFittingImageId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  useEffect(() => {
    if (fittingResult) {
      setViewMode('after');
      haptic('success');
      toast.success('Virtual fitting complete', {
        description: 'Check out the result',
      });
    }
  }, [fittingResult]);

  useEffect(() => {
    if (statusData?.fitting_image_status === 'FAILED') {
      haptic('error');
      toast.error('Fitting process failed');
    }
  }, [statusData?.fitting_image_status]);

  const handleStartFitting = async () => {
    if (!userImageUrl) return;
    setFittingImageId(null);
    haptic('tap');

    try {
      const result = await tryOnMutation.mutateAsync({
        product_id: product.product_id || 0,
        user_image_url: userImageUrl,
      });
      setFittingImageId(result.fitting_image_id);
    } catch (err) {
      console.error('Fitting request failed:', err);
      haptic('error');
      toast.error('Failed to start fitting');
    }
  };

  const handleGoToProfile = () => {
    haptic('tap');
    onClose();
    navigate('/profile');
  };

  const statusMessage =
    statusData?.fitting_image_status === 'RUNNING'
      ? 'Reconstructing fabric to your body shape'
      : 'Connecting to server';

  // No user photo state
  if (!userImageUrl) {
    return (
      <AnimatePresence>
        <motion.div
          className={cn(
            'fixed inset-0 z-[600] flex flex-col',
            // Dark background with subtle gradient
            'bg-[#0a0a0a]',
            'bg-gradient-to-b from-white/[0.02] via-transparent to-transparent'
          )}
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <FittingHeader onClose={onClose} />

          <main className="flex-1 flex items-center justify-center p-6">
            <motion.div
              className="text-center space-y-8 max-w-sm"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...springs.gentle }}
            >
              {/* Icon Container */}
              <motion.div
                className={cn(
                  'w-28 h-28 rounded-full mx-auto',
                  'bg-white/[0.03] backdrop-blur-sm',
                  'border border-white/[0.08]',
                  'flex items-center justify-center',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, ...springs.bouncy }}
              >
                <User size={44} className="text-white/20" />
              </motion.div>

              {/* Text */}
              <div className="space-y-3">
                <motion.h3
                  className="text-xl font-light text-white/90 tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  전신 사진이 필요합니다
                </motion.h3>
                <motion.p
                  className="text-sm text-white/40 font-light leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  가상 피팅을 이용하려면 프로필에서 전신 사진을 먼저 등록해주세요.
                </motion.p>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={handleGoToProfile}
                className={cn(
                  'px-8 py-4 rounded-xl',
                  'bg-white text-black',
                  'font-light text-sm tracking-wide',
                  'shadow-[0_4px_24px_rgba(255,255,255,0.15)]',
                  'hover:shadow-[0_6px_32px_rgba(255,255,255,0.2)]',
                  'transition-all duration-300'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, ...springs.gentle }}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
              >
                프로필로 이동
              </motion.button>
            </motion.div>
          </main>
        </motion.div>
      </AnimatePresence>
    );
  }

  const showStartButton = !fittingResult && !isGenerating;
  const showRetryOptions = !!fittingResult;

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed inset-0 z-[600] flex flex-col',
          // Dark background with subtle gradient
          'bg-[#0a0a0a]',
          'bg-gradient-to-b from-white/[0.02] via-transparent to-transparent'
        )}
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <FittingHeader onClose={onClose} />

        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 space-y-8">
            {/* Agent Status Indicator */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  className={cn(
                    'flex items-center justify-center gap-4 py-3 px-5 mx-auto',
                    'rounded-full w-fit',
                    // Glassmorphism pill
                    'bg-white/[0.03] backdrop-blur-xl',
                    'border border-white/[0.08]',
                    'shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                  )}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={springs.snappy}
                >
                  <AgentOrb state="thinking" size="sm" showPulse={false} />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 tracking-wider">
                      피팅 에이전트
                    </span>
                    <motion.span
                      className="text-xs text-white/70 font-light"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      요청 처리 중
                    </motion.span>
                  </div>
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full bg-white/60"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fitting Preview with Before/After Slider */}
            <FittingPreview
              userPhoto={userImageUrl}
              fittingResult={fittingResult}
              viewMode={viewMode}
              isGenerating={isGenerating}
              statusMessage={statusMessage}
              onViewModeChange={setViewMode}
            />

            {/* Product Brief and Actions */}
            <ProductBrief
              product={product}
              showStartButton={showStartButton}
              showRetryOptions={showRetryOptions}
              onStartFitting={handleStartFitting}
              onTryOther={onClose}
            />
          </div>
        </main>

        {/* Footer with Size Selection and Purchase */}
        <FittingFooter
          product={product}
          selectedProductId={selectedProductId}
          onSizeSelect={setSelectedProductId}
          onAddToCart={async () => {
            const productId = selectedProductId || product.product_id;
            if (!productId) {
              haptic('error');
              toast.error('Please select a size');
              return;
            }
            setIsProcessing(true);
            haptic('tap');
            try {
              await onAddToCart(productId);
              haptic('success');
            } finally {
              setIsProcessing(false);
            }
          }}
          onBuyNow={async () => {
            const productId = selectedProductId || product.product_id;
            if (!productId) {
              haptic('error');
              toast.error('Please select a size');
              return;
            }
            setIsProcessing(true);
            haptic('tap');
            try {
              await onBuyNow(productId);
              haptic('purchase');
              onClose();
            } finally {
              setIsProcessing(false);
            }
          }}
          isProcessing={isProcessing}
        />

        {/* Background Ambient Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
