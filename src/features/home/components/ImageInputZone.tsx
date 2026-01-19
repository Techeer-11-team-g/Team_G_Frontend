interface ImageInputZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageInputZone({ onFileChange }: ImageInputZoneProps) {
  return (
    <div className="group relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-5xl border border-black/5 bg-white p-10 shadow-2xl transition-all">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:32px_32px] opacity-[0.03]" />

      <label className="relative z-10 flex h-full w-full cursor-pointer flex-col items-center gap-8 text-center">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={onFileChange}
        />
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/5 text-black/20 transition-all duration-700 group-hover:bg-black group-hover:text-white">
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
          <p className="text-[14px] font-bold uppercase tracking-[0.3em]">Upload image</p>
          <p className="text-[10px] font-medium text-black/30">탭하여 이미지 파일 선택</p>
        </div>
      </label>
    </div>
  );
}
