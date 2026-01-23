import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingBag, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { path: '/home', label: '홈', icon: Home },
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
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-sticky border-t border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="pb-safe mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showBadge = item.path === '/cart' && cartCount > 0;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex min-w-[64px] flex-col items-center justify-center gap-1 px-4 py-2 transition-all ${
                isActive ? 'text-black' : 'text-black/30'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} className="transition-all" />
                {showBadge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] font-black text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wider transition-all ${
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
