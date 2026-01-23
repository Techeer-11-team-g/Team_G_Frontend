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
    <div className="relative z-10 py-6 px-4">
      <div
        className="flex items-center justify-center gap-1 p-1.5 rounded-2xl max-w-xs mx-auto"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {(['discover', 'history'] as const).map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors",
              activeTab === tab ? "text-black" : "text-white/40 hover:text-white/70"
            )}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === tab && (
              <motion.div
                className="absolute inset-0 bg-white rounded-xl"
                layoutId="conveyorTabBg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              {tab === 'discover' ? (
                <>
                  <Globe size={14} />
                  <span>Discover</span>
                </>
              ) : (
                <>
                  <Heart size={14} />
                  <span>History</span>
                </>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});
