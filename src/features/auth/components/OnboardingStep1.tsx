import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, MapPin, Phone, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingStep1() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    setIsLoading(true);

    // 데이터 저장
    const profileData = { name, address, phone, photo };
    localStorage.setItem('user_profile', JSON.stringify(profileData));
    if (photo) {
      localStorage.setItem('user_profile_photo', photo);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    navigate('/onboarding/step2');
  };

  const isFormValid = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1 rounded-full bg-black" />
            <div className="flex-1 h-1 rounded-full bg-black/10" />
          </div>
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">
            Step 1 of 2
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-4">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">프로필 설정</h1>
            <p className="text-[13px] text-black/50">
              가상 피팅을 위해 전신 사진을 등록해주세요
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {photo ? (
              <div className="relative">
                <div className="w-48 h-72 rounded-3xl bg-black/5 border-2 border-black/10 overflow-hidden shadow-xl">
                  <img
                    src={photo}
                    alt="Full body"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={18} className="text-black/60" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-72 rounded-3xl bg-black/[0.03] border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-4 hover:bg-black/[0.05] hover:border-black/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <Upload size={24} className="text-black/30" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-black/60">
                    전신 사진 등록
                  </p>
                  <p className="text-[11px] text-black/30 mt-1">
                    탭하여 업로드
                  </p>
                </div>
              </button>
            )}

            <p className="text-[11px] text-black/30 text-center max-w-[200px]">
              정면 전신 사진을 권장합니다. 가상 피팅에 사용됩니다.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <User
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30"
              />
              <input
                type="text"
                placeholder="이름 *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-black/10 pl-14 pr-5 py-4 text-[14px] rounded-2xl outline-none focus:border-black/30 transition-all"
                required
              />
            </div>

            {/* Address Input */}
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30"
              />
              <input
                type="text"
                placeholder="주소"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-black/10 pl-14 pr-5 py-4 text-[14px] rounded-2xl outline-none focus:border-black/30 transition-all"
              />
            </div>

            {/* Phone Input */}
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30"
              />
              <input
                type="tel"
                placeholder="전화번호"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-black/10 pl-14 pr-5 py-4 text-[14px] rounded-2xl outline-none focus:border-black/30 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '다음'
                )}
              </Button>
            </div>
          </form>

          {/* Skip Button */}
          <button
            type="button"
            onClick={() => navigate('/onboarding/step2')}
            className="w-full py-3 text-[12px] uppercase tracking-widest font-bold text-black/30 hover:text-black/60 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </main>
    </div>
  );
}
