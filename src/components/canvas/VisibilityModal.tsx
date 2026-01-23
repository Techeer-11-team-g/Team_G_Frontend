import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';

interface VisibilityModalProps {
  isSettingVisibility: boolean;
  onVisibilitySelect: (isPublic: boolean) => void;
  onSkip: () => void;
}

export function VisibilityModal({
  isSettingVisibility,
  onVisibilitySelect,
  onSkip,
}: VisibilityModalProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-zinc-900 rounded-3xl p-6 mx-4 max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <h3 className="text-white text-lg font-semibold text-center mb-2">
          분석 결과 공유하기
        </h3>
        <p className="text-white/50 text-sm text-center mb-6">
          다른 사용자들이 내 스타일을 볼 수 있도록 공개할까요?
        </p>

        <div className="space-y-3">
          {/* Public option */}
          <motion.button
            onClick={() => onVisibilitySelect(true)}
            disabled={isSettingVisibility}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Globe size={24} className="text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">공개</p>
              <p className="text-white/50 text-xs">
                Discover 피드에 공유됩니다
              </p>
            </div>
          </motion.button>

          {/* Private option */}
          <motion.button
            onClick={() => onVisibilitySelect(false)}
            disabled={isSettingVisibility}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Lock size={24} className="text-white/60" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">비공개</p>
              <p className="text-white/50 text-xs">
                나만 볼 수 있습니다
              </p>
            </div>
          </motion.button>
        </div>

        {/* Loading state */}
        {isSettingVisibility && (
          <div className="flex items-center justify-center gap-2 mt-4 text-white/50 text-sm">
            <motion.div
              className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            저장 중...
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={onSkip}
          disabled={isSettingVisibility}
          className="w-full mt-4 py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          나중에 설정하기
        </button>
      </motion.div>
    </motion.div>
  );
}
