import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Search } from 'lucide-react';
import { FormInput, LoadingButton, ProgressIndicator } from '@/components/ui';
import { useDaumPostcode } from '@/hooks';

export function OnboardingStep1() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddressComplete = useCallback((addr: string) => {
    setAddress(addr);
  }, []);

  const { openPostcode } = useDaumPostcode({
    onComplete: handleAddressComplete,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    setIsLoading(true);

    // 데이터 저장
    const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;
    const profileData = { name, address: fullAddress, phone };
    localStorage.setItem('user_profile', JSON.stringify(profileData));

    await new Promise((resolve) => setTimeout(resolve, 300));

    navigate('/onboarding/step2');
  };

  const isFormValid = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-6 py-6">
        <div className="max-w-md mx-auto">
          <ProgressIndicator currentStep={1} totalSteps={3} className="mb-6" />
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">
            Step 1 of 3
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-4">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">기본 정보</h1>
            <p className="text-[13px] text-black/50">
              서비스 이용을 위한 기본 정보를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              type="text"
              placeholder="이름 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              required
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={openPostcode}
                className="w-full flex items-center gap-3 bg-white border border-black/10 px-5 py-4 rounded-2xl text-left hover:border-black/20 transition-colors"
              >
                <MapPin size={18} className="text-black/30" />
                <span className={address ? 'text-[13px]' : 'text-[13px] text-black/40'}>
                  {address || '주소 검색'}
                </span>
                <Search size={16} className="ml-auto text-black/30" />
              </button>
              {address && (
                <input
                  type="text"
                  placeholder="상세 주소 입력"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full bg-white border border-black/10 px-5 py-4 text-[13px] rounded-2xl outline-none focus:border-black/30 transition-all"
                />
              )}
            </div>

            <FormInput
              type="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone size={18} />}
            />

            <div className="pt-4">
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!isFormValid}
              >
                다음
              </LoadingButton>
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
