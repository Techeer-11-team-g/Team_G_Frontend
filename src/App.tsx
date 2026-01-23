import { HomePage } from '@/features/home';
import { BottomNavigation } from '@/components/layout';
import { useCartStore } from '@/store';

/**
 * App - Root Layout Component (Home Page)
 *
 * 책임:
 * - 헤더 레이아웃
 * - 하단 네비게이션
 */
export default function App() {
  const { items: cartItems } = useCartStore();

  return (
    <div className="relative min-h-screen w-full bg-background pb-20 font-sans text-foreground selection:bg-black selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <HomePage />

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartItems.length} />
    </div>
  );
}

/**
 * Header - 심플한 로고 헤더
 */
function Header() {
  return (
    <header className="bg-background/90 sticky top-0 z-sticky flex w-full items-center justify-center border-b border-black/5 px-6 py-6 backdrop-blur-xl">
      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-tighter">Dres:sense</h2>
      </div>
    </header>
  );
}
