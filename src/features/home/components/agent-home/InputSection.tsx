import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MagneticInput } from '@/components/input';
import type { InputSectionProps } from './types';

export const InputSection = memo(function InputSection({
  isInFeedSection,
  localAgentState,
  keyboardHeight,
  voiceState,
  interimTranscript,
  textQuery,
  pendingImagePreview,
  products,
  isLoading,
  isVoiceSupported,
  onTextQueryChange,
  onSubmit,
  onImageClick,
  onVoiceClick,
  onClearPendingImage,
}: InputSectionProps) {
  const shouldShow =
    !isInFeedSection &&
    (localAgentState === 'idle' ||
      localAgentState === 'presenting' ||
      localAgentState === 'error');

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6"
        style={{ bottom: keyboardHeight }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="mx-auto max-w-md space-y-3">
          {/* Voice listening indicator */}
          <AnimatePresence>
            {voiceState === 'listening' && (
              <motion.div
                className="flex items-center justify-center gap-3 py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <motion.div
                    className="absolute inset-0 h-3 w-3 rounded-full bg-red-500"
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
                <span className="text-sm text-white/70">
                  {interimTranscript || '듣고 있어요...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Image Preview */}
          <AnimatePresence>
            {pendingImagePreview && (
              <motion.div
                className="mb-3 flex items-center gap-3 px-2"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <div className="relative">
                  <motion.img
                    src={pendingImagePreview}
                    alt="Upload preview"
                    className="h-14 w-14 rounded-xl object-cover"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}
                    layoutId="pending-image"
                  />
                  <motion.button
                    onClick={onClearPendingImage}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={12} className="text-white" />
                  </motion.button>
                </div>
                <span className="text-xs text-white/50">
                  메시지를 입력하거나 바로 전송하세요
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <MagneticInput
            value={voiceState === 'listening' ? interimTranscript : textQuery}
            onChange={onTextQueryChange}
            onSubmit={onSubmit}
            onImageClick={onImageClick}
            onVoiceClick={isVoiceSupported ? onVoiceClick : undefined}
            placeholder={
              voiceState === 'listening'
                ? '말씀하세요...'
                : pendingImagePreview
                  ? '이 이미지로 뭘 찾을까요? (예: 상의만 찾아줘)'
                  : products.length > 0
                    ? '검색을 더 구체화해보세요...'
                    : '원하는 스타일을 설명하거나 이미지를 업로드하세요...'
            }
            magneticStrength={0.15}
            showImageButton={!pendingImagePreview}
            showVoiceButton={isVoiceSupported && !pendingImagePreview}
            isVoiceListening={voiceState === 'listening'}
            disabled={isLoading}
            allowEmptySubmit={!!pendingImagePreview}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
