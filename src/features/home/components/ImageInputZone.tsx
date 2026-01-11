import type { InputMode } from '@/hooks';

interface ImageInputZoneProps {
  inputMode: InputMode;
  urlInput: string;
  showPasteTooltip: boolean;
  onInputModeChange: (mode: InputMode) => void;
  onUrlInputChange: (url: string) => void;
  onFileClick: () => void;
  onPasteClick: () => void;
  onUrlSubmit: (e: React.FormEvent) => void;
}

export function ImageInputZone({
  inputMode,
  urlInput,
  showPasteTooltip,
  onInputModeChange,
  onUrlInputChange,
  onFileClick,
  onPasteClick,
  onUrlSubmit,
}: ImageInputZoneProps) {
  const modes: InputMode[] = ['upload', 'paste', 'url'];

  return (
    <div className="space-y-6">
      {/* Input Mode Tabs */}
      <div className="flex bg-white/50 p-1.5 rounded-2xl border border-black/5 shadow-inner">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onInputModeChange(mode)}
            className={`flex-1 py-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all duration-300 ${
              inputMode === mode
                ? 'bg-black text-white shadow-xl'
                : 'opacity-30 hover:opacity-50'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Dynamic Input Zone */}
      <div className="min-h-[400px] bg-white rounded-5xl border border-black/5 shadow-2xl flex flex-col items-center justify-center p-10 relative group transition-all overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:32px_32px] opacity-[0.03]" />

        {/* Tooltip for Paste */}
        {inputMode === 'paste' && showPasteTooltip && (
          <div className="absolute top-10 bg-black text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest animate-bounce z-20">
            이미지를 복사한 후 아래 영역을 탭하세요
          </div>
        )}

        {inputMode === 'upload' && (
          <UploadContent onClick={onFileClick} />
        )}

        {inputMode === 'paste' && (
          <PasteContent onClick={onPasteClick} />
        )}

        {inputMode === 'url' && (
          <UrlContent
            urlInput={urlInput}
            onUrlInputChange={onUrlInputChange}
            onSubmit={onUrlSubmit}
          />
        )}
      </div>
    </div>
  );
}

function UploadContent({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center relative z-10 w-full h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      </div>
      <div className="space-y-2">
        <p className="text-[14px] font-bold uppercase tracking-[0.3em]">갤러리 업로드</p>
        <p className="text-[10px] text-black/30 font-medium">탭하여 이미지 파일 선택</p>
      </div>
    </div>
  );
}

function PasteContent({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-8 text-center relative z-10 w-full h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        </svg>
      </div>
      <div className="space-y-2">
        <p className="text-[14px] font-bold uppercase tracking-[0.3em]">클립보드 스캔</p>
        <p className="text-[10px] text-black/30 font-medium italic">
          복사한 이미지를 즉시 분석
        </p>
      </div>
    </div>
  );
}

function UrlContent({
  urlInput,
  onUrlInputChange,
  onSubmit,
}: {
  urlInput: string;
  onUrlInputChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form className="w-full space-y-8 relative z-10" onSubmit={onSubmit}>
      <div className="space-y-2 text-center">
        <p className="text-[12px] font-black uppercase tracking-widest text-black/20">
          Remote Artifact URL
        </p>
      </div>
      <input
        type="url"
        required
        placeholder="https://images.unsplash.com/..."
        className="w-full bg-black/5 border-none px-6 py-5 text-[12px] rounded-2xl outline-none ring-1 ring-black/5 focus:ring-black/20 transition-all"
        value={urlInput}
        onChange={(e) => onUrlInputChange(e.target.value)}
      />
      <button
        type="submit"
        className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.5em] font-black rounded-2xl shadow-2xl active:scale-95 transition-all"
      >
        이미지 가져오기
      </button>
    </form>
  );
}
