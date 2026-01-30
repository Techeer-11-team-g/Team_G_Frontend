import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, User } from 'lucide-react';
import { AgentOrb } from '@/components/agent';
import { PinterestFeed } from '@/components/feed';
import { MainHeader } from '@/components/layout';
import { AgentHomePage } from './agent-home';
import { useCartStore } from '@/store';
import { haptic, springs } from '@/motion';

// =============================================
// Configuration
// =============================================
const CONFIG = {
  // Animation timing (ms) - reduced for better LCP
  initialDelay: 100,

  // Typography
  letterSpacing: '-0.02em',
};

// =============================================
// Main Component
// =============================================
const VISITED_KEY = 'dressense_home_visited';
const VIEW_KEY = 'dressense_current_view';

export function NewHomePage() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if user has visited before (persisted in sessionStorage)
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    return !sessionStorage.getItem(VISITED_KEY);
  });

  // Animation states
  const [showFeed, setShowFeed] = useState(!isFirstVisit);
  const [currentView, setCurrentView] = useState<'feed' | 'agent'>(() => {
    const savedView = sessionStorage.getItem(VIEW_KEY);
    if (savedView === 'agent') return 'agent';
    return 'feed';
  });

  // Persist current view to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(VIEW_KEY, currentView);
  }, [currentView]);

  // Animation sequence - only on first visit (reduced delay for better LCP)
  useEffect(() => {
    if (isFirstVisit) {
      // Show feed after minimal delay for better LCP
      const feedTimer = setTimeout(() => {
        setShowFeed(true);
        // Mark as visited after animation completes
        sessionStorage.setItem(VISITED_KEY, 'true');
        setIsFirstVisit(false);
      }, CONFIG.initialDelay + 400); // Reduced from 1000ms to 400ms

      return () => {
        clearTimeout(feedTimer);
      };
    }
  }, [isFirstVisit]);

  // Handle orb click
  const handleOrbClick = useCallback(() => {
    haptic('tap');
    setCurrentView('agent');
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Feed View */}
      <AnimatePresence mode="wait">
        {currentView === 'feed' && (
          <motion.div
            key="feed"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header - Fixed at top */}
            <header className="fixed inset-x-0 top-0 z-50 px-6 py-4">
              <nav className="mx-auto flex max-w-6xl items-center justify-end">
                {/* Navigation icons with AgentOrb */}
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showFeed ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* AI Agent Orb - xs size, before order icon */}
                  <AgentOrb
                    state="idle"
                    size="xs"
                    onClick={handleOrbClick}
                    showPulse={false}
                  />
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                    title="주문내역"
                  >
                    <Package size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="relative text-white/60 transition-colors duration-300 hover:text-white"
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
                    onClick={() => navigate('/profile')}
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                    title="프로필"
                  >
                    <User size={18} strokeWidth={1.5} />
                  </button>
                </motion.div>
              </nav>
            </header>

            {/* Scrollable Content Area */}
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto overscroll-contain"
            >
              {/* Logo - moves to header when feed shows */}
              <LogoTypography
                showFeed={showFeed}
                isFirstVisit={isFirstVisit}
              />

              {/* Feed Container */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: showFeed ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Animated spacer - shrinks when feed is shown */}
                <motion.div
                  initial={{ height: isFirstVisit ? '50vh' : 0 }}
                  animate={{ height: showFeed ? 0 : (isFirstVisit ? '50vh' : 0) }}
                  transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 120,
                  }}
                />

                {/* The actual feed - fills the screen */}
                <div className="min-h-screen bg-black pb-20">
                  <PinterestFeed />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Agent View */}
        {currentView === 'agent' && (
          <motion.div
            key="agent"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            style={{
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header with navigation */}
            <MainHeader
              showOrb={false}
              pageLabel="Agent"
              onLogoClick={() => {
                haptic('tap');
                setCurrentView('feed');
              }}
            />

            {/* Agent Home Page Content */}
            <AgentHomePage hideHeader />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================
// Logo Typography Component
// =============================================
interface LogoTypographyProps {
  showFeed: boolean;
  isFirstVisit: boolean;
}

function LogoTypography({ showFeed, isFirstVisit }: LogoTypographyProps) {
  // Logo position:
  // - First visit, before feed: centered in screen, large
  // - After feed shows: moves to header left side, becomes small header text
  // - Not first visit: already in header position

  const isInHeader = showFeed || !isFirstVisit;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none flex items-center gap-3"
      initial={{
        top: isFirstVisit ? '45vh' : 20,
        left: isFirstVisit ? '50%' : 24,
        x: isFirstVisit ? '-50%' : 0,
        opacity: 0,
      }}
      animate={{
        top: isInHeader ? 20 : '45vh',
        left: isInHeader ? 24 : '50%',
        x: isInHeader ? 0 : '-50%',
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 120,
        delay: isFirstVisit && !showFeed ? 0.3 : 0,
      }}
    >
      <motion.span
        className="font-black text-white"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 900,
          letterSpacing: '-0.02em',
        }}
        initial={{
          fontSize: isFirstVisit ? 'clamp(32px, 8vw, 80px)' : '13px',
        }}
        animate={{
          fontSize: isInHeader ? '13px' : 'clamp(32px, 8vw, 80px)',
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 120,
        }}
      >
        DRESSENSE
      </motion.span>

      {/* Feed label - only shows when in header */}
      <AnimatePresence>
        {isInHeader && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">
              Feed
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default NewHomePage;
