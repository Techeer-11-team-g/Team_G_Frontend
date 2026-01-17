import type { InputMode } from '@/hooks';

interface ImageInputZoneProps {
  inputMode: InputMode;
  urlInput: string;
  onInputModeChange: (mode: InputMode) => void;
  onUrlInputChange: (url: string) => void;
  onUrlSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageInputZone({
  inputMode,
  urlInput,
  onInputModeChange,
  onUrlInputChange,
  onUrlSubmit,
  onFileChange,
}: ImageInputZoneProps) {
  const modes: InputMode[] = ['upload', 'url'];

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:32px_32px] opacity-[0.03]" />

        {inputMode === 'upload' && <UploadContent onFileChange={onFileChange} />}

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

function UploadContent({
  onFileChange,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-8 text-center relative z-10 w-full h-full cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onFileChange}
      />
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
    </label>
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
