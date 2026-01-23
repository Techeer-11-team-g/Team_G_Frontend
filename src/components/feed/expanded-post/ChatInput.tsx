import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { haptic } from '@/motion';
import { MagneticInput } from '@/components/input';
import type { ChatProduct } from '@/types/api';

interface ChatInputSectionProps {
  isActive: boolean;
  analysisId: number | undefined;
  selectedObjectId: number | null;
  chatInput: string;
  agentMessage: string;
  isChatLoading: boolean;
  isChatFitting: boolean;
  isReSearching: boolean;
  showChatResults: boolean;
  fittingImageUrl: string | null;
  chatProducts: ChatProduct[];
  keyboardHeight: number;
  onChatInputChange: (value: string) => void;
  onChatSubmit: () => void;
  onAgentMessageDismiss: () => void;
  onFittingImageDismiss: () => void;
  onChatResultsDismiss: () => void;
  onChatProductSelect: (product: ChatProduct) => void;
  onReSearch: () => void;
}

export const ChatInputSection = memo(function ChatInputSection({
  isActive,
  analysisId,
  selectedObjectId,
  chatInput,
  agentMessage,
  isChatLoading,
  isChatFitting,
  isReSearching,
  showChatResults,
  fittingImageUrl,
  chatProducts,
  keyboardHeight,
  onChatInputChange,
  onChatSubmit,
  onAgentMessageDismiss,
  onFittingImageDismiss,
  onChatResultsDismiss,
  onChatProductSelect,
  onReSearch,
}: ChatInputSectionProps) {
  if (!isActive || !analysisId || selectedObjectId !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-0 z-40 bg-gradient-to-t from-black via-black/80 to-transparent p-6"
        style={{ bottom: keyboardHeight }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="mx-auto max-w-md space-y-3">
          {/* Agent Message */}
          <AnimatePresence>
            {agentMessage && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  className="flex items-center gap-2 max-w-[300px] rounded-2xl px-4 py-2"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/80 text-center flex-1">
                    {agentMessage}
                  </p>
                  <motion.button
                    onClick={onAgentMessageDismiss}
                    className="flex-shrink-0 rounded-full p-1 hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={12} className="text-white/50" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fitting Result */}
          <AnimatePresence>
            {fittingImageUrl && (
              <motion.div
                className="relative flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <img
                    src={fittingImageUrl}
                    alt="피팅 결과"
                    className="max-h-[60vh] w-auto object-contain"
                  />
                  <motion.button
                    onClick={onFittingImageDismiss}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} className="text-white/70" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Results */}
          <AnimatePresence>
            {showChatResults && chatProducts.length > 0 && !fittingImageUrl && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  className="no-scrollbar flex gap-3 overflow-x-auto rounded-2xl px-3 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {chatProducts.slice(0, 4).map((product, idx) => (
                    <motion.div
                      key={product.product_id}
                      className="w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onChatProductSelect(product);
                        haptic('tap');
                      }}
                    >
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-28 w-full object-cover"
                      />
                      <div className="p-2">
                        <p className="truncate text-[9px] uppercase tracking-wider text-white/50">
                          {product.brand_name}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-white/80">
                          {product.product_name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white">
                          {product.selling_price?.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={onChatResultsDismiss}
                  className="absolute -top-2 right-0 rounded-full bg-black/60 p-1.5"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={12} className="text-white/70" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Action - Re-search Button */}
          {!showChatResults && !fittingImageUrl && !agentMessage && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.button
                onClick={onReSearch}
                disabled={isReSearching || isChatLoading}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all',
                  isReSearching || isChatLoading
                    ? 'cursor-not-allowed bg-white/5 text-white/30'
                    : 'border border-white/20 bg-white/10 text-white/70 hover:bg-white/15'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isReSearching ? (
                  <motion.div
                    className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white/70"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <RefreshCw size={14} />
                )}
                전체 상품 재검색
              </motion.button>
            </motion.div>
          )}

          {/* Chat Input */}
          <MagneticInput
            value={chatInput}
            onChange={onChatInputChange}
            onSubmit={onChatSubmit}
            placeholder="바지 검색해줘, 비슷한 상의 찾아줘..."
            disabled={isChatLoading || isChatFitting || isReSearching}
            showImageButton={false}
            showVoiceButton={false}
            magneticStrength={0}
            minimal
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
