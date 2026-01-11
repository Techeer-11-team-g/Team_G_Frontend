import { useState } from 'react';
import { SplashScreen, HomePage } from '@/features/home';
import { BottomNavigation } from '@/components/layout';
import { useCartStore } from '@/store';

/**
 * App - Root Layout Component (Home Page)
 *
 * 책임:
 * - 스플래시 스크린 제어
 * - 헤더 레이아웃
 * - 하단 네비게이션
 * - 프로필 사진 상태 (localStorage sync)
 */
export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(
    localStorage.getItem('user_profile_photo')
  );

  const { items: cartItems } = useCartStore();

  const handleSaveUserPhoto = (photo: string) => {
    setUserProfilePhoto(photo);
    localStorage.setItem('user_profile_photo', photo);
  };

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white pb-20">
      {/* Splash Screen */}
      {!hasEntered && <SplashScreen onEnter={() => setHasEntered(true)} />}

      {/* Main Studio Interface */}
      <div
        className={`transition-all duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <HomePage
          userProfilePhoto={userProfilePhoto}
          onSaveUserPhoto={handleSaveUserPhoto}
        />

        {/* Bottom Navigation */}
        <BottomNavigation cartCount={cartItems.length} />
      </div>
    </div>
  );
}

/**
 * Header - 심플한 로고 헤더
 */
function Header() {
  return (
    <header className="sticky top-0 w-full px-6 py-6 flex justify-center items-center z-sticky bg-background/90 backdrop-blur-xl border-b border-black/5">
      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-tighter">
          Dres:sense
        </h2>
        <span className="text-[8px] uppercase tracking-widest font-black opacity-30 italic">
          AI Fashion Studio
        </span>
      </div>
    </header>
  );
}
