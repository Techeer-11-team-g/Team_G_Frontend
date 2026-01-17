import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store';

export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Unicorn Studio 스크립트 로드
    const win = window as any;
    if (!win.UnicornStudio) {
      win.UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js';
      script.onload = () => {
        if (!win.UnicornStudio.isInitialized) {
          win.UnicornStudio.init();
          win.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(script);
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Unicorn Studio Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div data-us-project="CIffkwmB6ss7ZUWUNNlm" style={{ width: '100vw', height: '100vh' }} />
      </div>

      {/* CTA Buttons */}
      <div className="animate-in fade-in slide-in-from-bottom-8 absolute bottom-0 left-0 right-0 z-10 px-6 pb-6 duration-1000">
        <div className="mx-auto w-full max-w-md space-y-4">
          <Button
            onClick={handleGetStarted}
            className="w-full bg-white text-black shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90"
            size="lg"
          >
            <span>시작하기</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
