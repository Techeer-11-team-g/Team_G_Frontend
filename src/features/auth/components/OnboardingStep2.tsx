import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Lock, Check } from 'lucide-react';
import { FormInput, LoadingButton, ProgressIndicator } from '@/components/ui';

export function OnboardingStep2() {
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // 결제 정보 저장 (실제로는 토큰화 필요)
    const paymentData = {
      cardNumber: cardNumber.replace(/\s/g, '').slice(-4), // 마지막 4자리만 저장
      expiryDate,
      cardHolder,
    };
    localStorage.setItem('user_payment', JSON.stringify(paymentData));
    localStorage.setItem('onboarding_completed', 'true');

    await new Promise((resolve) => setTimeout(resolve, 800));

    navigate('/home');
  };

  const isFormValid =
    cardNumber.replace(/\s/g, '').length >= 15 &&
    expiryDate.length === 5 &&
    cvc.length >= 3;

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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-6 py-6">
        <div className="max-w-md mx-auto">
          <ProgressIndicator currentStep={2} totalSteps={2} className="mb-6" />
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">
            Step 2 of 2
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-4">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">결제수단 등록</h1>
            <p className="text-[13px] text-black/50">
              빠른 결제를 위해 카드를 등록해주세요
            </p>
          </div>

          {/* Card Preview */}
          <div className="relative h-48 rounded-3xl bg-gradient-to-br from-black via-black/90 to-black/80 p-6 shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            {/* Card Content */}
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                  <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80" />
                </div>
                {cardBrand && (
                  <span className="text-white/80 text-[13px] font-bold tracking-wider">
                    {cardBrand}
                  </span>
                )}
              </div>

              <div>
                <p className="text-white/90 text-lg tracking-[0.2em] font-mono">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-wider">
                      Card Holder
                    </p>
                    <p className="text-white/90 text-[13px] font-medium uppercase tracking-wider">
                      {cardHolder || 'YOUR NAME'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[9px] uppercase tracking-wider">
                      Expires
                    </p>
                    <p className="text-white/90 text-[13px] font-medium tracking-wider">
                      {expiryDate || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              type="text"
              placeholder="카드번호"
              value={cardNumber}
              onChange={handleCardNumberChange}
              icon={<CreditCard size={18} />}
              className="font-mono tracking-wider"
              inputMode="numeric"
            />

            <FormInput
              type="text"
              placeholder="카드 소유자 이름"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="uppercase tracking-wider"
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
              />
            </div>

            <div className="flex items-center gap-3 py-3 px-4 bg-black/[0.03] rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <p className="text-[11px] text-black/50 flex-1">
                모든 결제 정보는 안전하게 암호화되어 처리됩니다
              </p>
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
            onClick={() => {
              localStorage.setItem('onboarding_completed', 'true');
              navigate('/home');
            }}
            className="w-full py-3 text-[12px] uppercase tracking-widest font-bold text-black/30 hover:text-black/60 transition-colors"
          >
            나중에 등록하기
          </button>
        </div>
      </main>
    </div>
  );
}
