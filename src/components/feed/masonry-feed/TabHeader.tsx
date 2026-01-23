import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TabHeaderProps } from './types';

export const TabHeader = memo(function TabHeader({
  activeTab,
  onTabChange,
}: TabHeaderProps) {
  return (
    <div className="sticky top-0 z-10 py-4 px-4">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
          backdropFilter: 'blur(20px)',
        }}
      />
      <div className="relative flex items-center justify-center gap-1 p-1.5 rounded-2xl bg-white/[0.06] max-w-xs mx-auto border border-white/[0.08]">
        {(['discover', 'history'] as const).map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors duration-300",
              activeTab === tab
                ? "text-black"
                : "text-white/50 hover:text-white/80"
            )}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === tab && (
              <motion.div
                className="absolute inset-0 bg-white rounded-xl"
                layoutId="activeTabBg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              {tab === 'discover' ? (
                <>
                  <Globe size={14} />
                  Discover
                </>
              ) : (
                <>
                  <Heart size={14} />
                  History
                </>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});
