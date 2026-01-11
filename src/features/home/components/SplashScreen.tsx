interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <section
      onClick={onEnter}
      className="fixed inset-0 z-splash bg-white flex flex-col items-center justify-center p-8 text-center cursor-pointer"
    >
      <div className="space-y-6 animate-in fade-in zoom-in duration-1000">
        <span className="text-[10px] uppercase tracking-[1em] font-black opacity-30">
          Atelier System v4
        </span>
        <h1 className="font-serif text-[24vw] leading-none tracking-tighter">W'ON</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white animate-bounce shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
          <p className="text-[9px] uppercase tracking-[0.6em] font-black opacity-40">
            터치하여 스캔 시작
          </p>
        </div>
      </div>
    </section>
  );
}
