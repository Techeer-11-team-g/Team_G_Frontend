import { memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { FeedItem } from '@/types/api';

interface PostHeaderProps {
  item: FeedItem;
  isOwn: boolean;
  isToggling: boolean;
  onVisibilityToggle: () => void;
}

export const PostHeader = memo(function PostHeader({
  item,
  isOwn,
  isToggling,
  onVisibilityToggle,
}: PostHeaderProps) {
  return (
    <div
      className="flex items-center justify-between bg-black/50 px-4 py-3"
      style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}
    >
      <div className="flex items-center gap-3">
        {item.user && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <span className="text-sm font-bold text-white">
                {item.user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{item.user.username}</p>
              <p className="text-[10px] text-white/40">
                {new Date(item.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Visibility Toggle for own posts */}
      {isOwn && (
        <motion.button
          onClick={onVisibilityToggle}
          disabled={isToggling}
          className={cn(
            'mr-12 flex items-center gap-2 rounded-full px-3 py-2 transition-all',
            item.is_public
              ? 'border-emerald-500/30 bg-emerald-500/25'
              : 'border-white/10 bg-white/10'
          )}
          style={{ border: '1px solid' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          {item.is_public ? (
            <Globe size={14} className="text-emerald-400" />
          ) : (
            <Lock size={14} className="text-white/50" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              item.is_public ? 'text-emerald-400' : 'text-white/50'
            )}
          >
            {item.is_public ? '공개' : '비공개'}
          </span>
        </motion.button>
      )}
    </div>
  );
});
