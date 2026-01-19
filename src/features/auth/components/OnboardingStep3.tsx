import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput, LoadingButton, ProgressIndicator } from '@/components/ui';
import { usersApi } from '@/api';
import { useUserStore } from '@/store';

export function OnboardingStep3() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 카드번호 포맷팅 (4자리씩 끊기)
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  // 만료일 포맷팅 (MM/YY)
  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const callOnboardingApi = async (paymentInfo: string) => {
    // Step1에서 저장한 프로필 데이터 가져오기
    const profileStr = localStorage.getItem('user_profile');
    const profile = profileStr ? JSON.parse(profileStr) : {};

    // SignUp에서 저장한 이메일 가져오기
    const userEmail = localStorage.getItem('user_email') || '';

    try {
      const userProfile = await usersApi.onboarding({
        user_email: userEmail,
        address: profile.address || '',
        payment: paymentInfo,
        phone_number: profile.phone || '',
      });

      // Store에 유저 정보 저장
      setUser(userProfile);

      // 임시 데이터 정리
      localStorage.removeItem('user_email');
      localStorage.setItem('onboarding_completed', 'true');

      toast.success('회원가입이 완료되었습니다!');
      navigate('/home');
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 결제 정보 (마지막 4자리만 전송)
    const paymentInfo = `**** **** **** ${cardNumber.replace(/\s/g, '').slice(-4)}`;

    await callOnboardingApi(paymentInfo);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    await callOnboardingApi('');
  };

  const isFormValid =
    cardNumber.replace(/\s/g, '').length >= 15 && expiryDate.length === 5 && cvc.length >= 3;

  // 카드 브랜드 감지
  const getCardBrand = () => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (/^62/.test(number)) return 'UnionPay';
    return null;
  };

  const cardBrand = getCardBrand();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="w-full px-6 py-6">
        <div className="mx-auto max-w-md">
          <ProgressIndicator currentStep={3} totalSteps={3} className="mb-6" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40">
            Step 3 of 3
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-4">
        <div className="animate-in fade-in slide-in-from-bottom-5 space-y-8 duration-700">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">결제수단 등록</h1>
            <p className="text-[13px] text-black/50">빠른 결제를 위해 카드를 등록해주세요</p>
          </div>

          {/* Card Preview */}
          <div className="relative h-48 overflow-hidden rounded-3xl bg-gradient-to-br from-black via-black/90 to-black/80 p-6 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-white" />
              <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/2 rounded-full bg-white" />
            </div>

            {/* Card Content */}
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-12 items-center justify-center rounded bg-gradient-to-br from-yellow-300 to-yellow-500">
                  <div className="h-6 w-8 rounded-sm bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80" />
                </div>
                {cardBrand && (
                  <span className="text-[13px] font-bold tracking-wider text-white/80">
                    {cardBrand}
                  </span>
                )}
              </div>

              <div>
                <p className="font-mono text-lg tracking-[0.2em] text-white/90">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/40">Card Holder</p>
                    <p className="text-[13px] font-medium uppercase tracking-wider text-white/90">
                      {cardHolder || 'YOUR NAME'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-white/40">Expires</p>
                    <p className="text-[13px] font-medium tracking-wider text-white/90">
                      {expiryDate || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            <FormInput
              type="text"
              placeholder="카드번호"
              value={cardNumber}
              onChange={handleCardNumberChange}
              icon={<CreditCard size={18} />}
              className="font-mono tracking-wider"
              inputMode="numeric"
              autoComplete="off"
            />

            <FormInput
              type="text"
              placeholder="카드 소유자 이름"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="uppercase tracking-wider"
              autoComplete="off"
            />

            <div className="flex gap-4">
              <FormInput
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                icon={<Calendar size={18} />}
                wrapperClassName="flex-1"
                className="font-mono"
                inputMode="numeric"
                autoComplete="off"
              />
              <FormInput
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={handleCvcChange}
                icon={<Lock size={18} />}
                wrapperClassName="flex-1"
                className="font-mono"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>

            <div className="pt-4">
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!isFormValid}
              >
                완료
              </LoadingButton>
            </div>
          </form>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full py-3 text-[12px] font-bold uppercase tracking-widest text-black/30 transition-colors hover:text-black/60 disabled:opacity-50"
          >
            나중에 등록하기
          </button>
        </div>
      </main>
    </div>
  );
}
