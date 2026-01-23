import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe } from 'lucide-react';
import type { FeedTab } from './types';

interface EmptyStateProps {
  activeTab: FeedTab;
}

export const EmptyState = memo(function EmptyState({ activeTab }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        animate={{
          rotate: [0, 5, -5, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {activeTab === 'discover' ? (
          <Globe size={32} className="text-white/20" />
        ) : (
          <Heart size={32} className="text-white/20" />
        )}
      </motion.div>
      <p className="text-white/50 text-sm font-medium mb-1">
        {activeTab === 'discover'
          ? '공개된 스타일이 없습니다'
          : '분석한 이미지가 없습니다'}
      </p>
      <p className="text-white/25 text-xs leading-relaxed max-w-[200px]">
        {activeTab === 'discover'
          ? '첫 번째로 스타일을 공유해보세요!'
          : '이미지를 업로드하여 AI 스타일 분석을 시작하세요'}
      </p>
    </motion.div>
  );
});
