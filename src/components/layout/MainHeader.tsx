import { useNavigate, useLocation } from 'react-router-dom';
import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AgentOrb } from '@/components/agent';
import { useCart } from '@/features/cart/hooks/useCart';
import { haptic, springs } from '@/motion';

interface MainHeaderProps {
  onOrbClick?: () => void;
  onLogoClick?: () => void;
  showOrb?: boolean;
  pageLabel?: string;
}

const PAGE_LABELS: Record<string, string> = {
  '/home': '',
  '/orders': 'Orders',
  '/cart': 'Cart',
  '/profile': 'Profile',
};

export const MainHeader = memo(function MainHeader({ onOrbClick, onLogoClick, showOrb = true, pageLabel }: MainHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { items: cartItems } = useCart();

  const currentPageLabel = useMemo(
    () => pageLabel !== undefined ? pageLabel : (PAGE_LABELS[location.pathname] || ''),
    [pageLabel, location.pathname]
  );

  const handleOrbClick = useCallback(() => {
    if (onOrbClick) {
      onOrbClick();
    } else {
      haptic('tap');
      // If already on home, just scroll to top
      if (location.pathname === '/home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Navigate to home, then scroll to top after a short delay
        navigate('/home');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [onOrbClick, location.pathname, navigate]);

  const handleLogoClick = useCallback(() => {
    haptic('tap');
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/home');
    }
  }, [onLogoClick, navigate]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo + Page indicator */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <span
              className="font-black text-white text-[13px]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              DRESSENSE
            </span>
            {currentPageLabel && (
              <>
                <span className="text-white/20 text-xs">/</span>
                <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">
                  {currentPageLabel}
                </span>
              </>
            )}
          </button>
        </motion.div>

        {/* Navigation icons */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {showOrb && (
            <AgentOrb
              state="idle"
              size="xs"
              onClick={handleOrbClick}
              showPulse={false}
            />
          )}
          <button
            onClick={() => {
              haptic('tap');
              // Invalidate orders query to refresh data
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              navigate('/orders');
            }}
            className={`transition-colors duration-300 ${
              location.pathname === '/orders'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
            title="주문내역"
          >
            <Package size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => {
              haptic('tap');
              // Invalidate cart query to refresh data
              queryClient.invalidateQueries({ queryKey: ['cart'] });
              navigate('/cart');
            }}
            className={`relative transition-colors duration-300 ${
              location.pathname === '/cart'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
            title="장바구니"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartItems.length > 0 && (
              <motion.span
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-black"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.bouncy}
              >
                {cartItems.length}
              </motion.span>
            )}
          </button>
          <button
            onClick={() => {
              haptic('tap');
              navigate('/profile');
            }}
            className={`transition-colors duration-300 ${
              location.pathname === '/profile'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
            title="프로필"
          >
            <User size={18} strokeWidth={1.5} />
          </button>
        </motion.div>
      </nav>
    </header>
  );
});

export default MainHeader;
