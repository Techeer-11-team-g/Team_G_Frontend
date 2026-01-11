import { useRef } from 'react';

interface UserPhotoUploadProps {
  onUpload: (photo: string) => void;
}

export function UserPhotoUpload({ onUpload }: UserPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
      <div className="w-28 h-28 rounded-full bg-black/5 flex items-center justify-center text-black/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="space-y-4">
        <h3 className="font-serif text-3xl italic font-light">Your Archive</h3>
        <p className="text-[12px] text-black/40 leading-relaxed">
          본인의 전신 사진을 1회 업로드하면 <br />
          AI가 체형에 맞춰 옷을 입혀드립니다.
        </p>
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-12 py-5 bg-black text-white text-[11px] uppercase font-black tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all"
      >
        사진 선택하기
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}

