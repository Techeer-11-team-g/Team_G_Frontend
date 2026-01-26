import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, User, Package } from 'lucide-react';
import { springs } from '@/motion';
import type { AgentHeaderProps } from './types';

export const AgentHeader = memo(function AgentHeader({
  cartItemsCount,
  onNavigate,
}: AgentHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 py-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <motion.a
          href="/"
          className="text-[13px] font-light tracking-[0.3em] text-white/80 transition-colors hover:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          DRESSENSE
        </motion.a>

        <motion.div
          className="flex items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <button
            onClick={() => onNavigate('/orders', { state: { from: '/home/agent' } })}
            className="text-white/60 transition-colors duration-300 hover:text-white"
            title="주문내역"
          >
            <Package size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onNavigate('/cart', { state: { from: '/home/agent' } })}
            className="relative text-white/60 transition-colors duration-300 hover:text-white"
            title="장바구니"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartItemsCount > 0 && (
              <motion.span
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-black"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.bouncy}
              >
                {cartItemsCount}
              </motion.span>
            )}
          </button>
          <button
            onClick={() => onNavigate('/profile', { state: { from: '/home/agent' } })}
            className="text-white/60 transition-colors duration-300 hover:text-white"
            title="프로필"
          >
            <User size={18} strokeWidth={1.5} />
          </button>
        </motion.div>
      </nav>
    </header>
  );
});
