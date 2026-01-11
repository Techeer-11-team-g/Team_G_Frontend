import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
      destroy: () => void;
    };
  }
}

export function LandingPage() {
  const navigate = useNavigate();

  // Unicorn Studio 초기화
  useEffect(() => {
    const initUnicorn = () => {
      if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };

    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {}, destroy: () => {} };
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js';
      script.onload = initUnicorn;
      document.head.appendChild(script);
    } else {
      initUnicorn();
    }

    return () => {
      if (window.UnicornStudio?.destroy) {
        window.UnicornStudio.destroy();
        window.UnicornStudio.isInitialized = false;
      }
    };
  }, []);

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('is_logged_in');
    if (isLoggedIn) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Unicorn Studio Background */}
      <div className="absolute inset-0 z-0">
        <div
          data-us-project="CIffkwmB6ss7ZUWUNNlm"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-8">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-black text-white/60">
                Beta
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6 pb-20">
          <div className="max-w-md mx-auto w-full space-y-8">
            {/* Logo & Title */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-5xl font-bold tracking-tight text-white">
                Dres:sense
              </h1>
              <p className="text-lg text-white/70 font-light leading-relaxed">
                AI가 당신의 스타일을 분석하고
                <br />
                완벽한 핏을 찾아드립니다
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-8 h-px bg-white/30" />
                <span className="text-[12px] uppercase tracking-widest">
                  Style Analysis
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-8 h-px bg-white/30" />
                <span className="text-[12px] uppercase tracking-widest">
                  Virtual Try-On
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <div className="w-8 h-px bg-white/30" />
                <span className="text-[12px] uppercase tracking-widest">
                  Smart Shopping
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button
                onClick={handleGetStarted}
                className="w-full bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 shadow-2xl"
                size="lg"
              >
                <span>시작하기</span>
                <ArrowRight size={18} />
              </Button>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 text-[13px] text-white/50 hover:text-white transition-colors"
              >
                이미 계정이 있으신가요? <span className="font-semibold">로그인</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[9px] uppercase tracking-widest font-black text-white/20">
              Dres:sense v1.0.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
