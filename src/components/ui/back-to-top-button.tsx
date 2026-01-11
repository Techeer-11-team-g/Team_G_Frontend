export function BackToTopButton() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-50">
      <button
        onClick={handleClick}
        className="w-full py-5 bg-black/90 backdrop-blur-xl text-white text-[11px] uppercase font-black tracking-[0.6em] rounded-2xl shadow-2xl active:scale-95 transition-all"
      >
        Back to Top
      </button>
    </div>
  );
}

