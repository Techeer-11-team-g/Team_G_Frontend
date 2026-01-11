import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingBag, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/orders', label: '주문내역', icon: Package },
  { path: '/cart', label: '장바구니', icon: ShoppingBag },
  { path: '/profile', label: '프로필', icon: User },
];

interface BottomNavigationProps {
  cartCount?: number;
}

export function BottomNavigation({ cartCount = 0 }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-sticky bg-white/90 backdrop-blur-xl border-t border-black/5 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showBadge = item.path === '/cart' && cartCount > 0;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px] transition-all ${
                isActive ? 'text-black' : 'text-black/30'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-all"
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] uppercase tracking-wider font-black transition-all ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
