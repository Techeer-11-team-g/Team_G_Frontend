import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, CreditCard, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '@/api';
import { useUserStore } from '@/store';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';

// Progress Indicator Component
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'h-[2px] rounded-full transition-all duration-500',
            i < currentStep ? 'bg-white w-8' : i === currentStep ? 'bg-white/60 w-6' : 'bg-white/20 w-4'
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        />
      ))}
    </div>
  );
}

// Glass Card Input
function GlassInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
  isFocused,
  className,
  inputMode,
}: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  className?: string;
  inputMode?: 'text' | 'numeric';
}) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl rounded-xl border transition-all duration-300',
        isFocused
          ? 'bg-white/[0.08] border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
      )}
    >
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        inputMode={inputMode}
        className={cn(
          'w-full bg-transparent px-4 py-4 text-[15px] font-light tracking-wide',
          'outline-none placeholder:text-white/30',
          className
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

export function OnboardingStep3() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

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
    const profileStr = localStorage.getItem('user_profile');
    const profile = profileStr ? JSON.parse(profileStr) : {};
    // localStorage 또는 user store에서 이메일 가져오기 (Google 로그인 지원)
    const userEmail = localStorage.getItem('user_email') || user?.user_email || '';

    try {
      const userProfile = await usersApi.onboarding({
        user_email: userEmail,
        address: profile.address || '',
        payment: paymentInfo,
        phone_number: profile.phone || '',
      });

      setUser(userProfile);
      localStorage.removeItem('user_email');
      localStorage.setItem('onboarding_completed', 'true');

      haptic('success');
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate('/home');
    } catch (error) {
      console.error('Onboarding failed:', error);
      haptic('error');
      toast.error('설정에 실패했습니다');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic('tap');
    setIsLoading(true);
    const paymentInfo = `**** **** **** ${cardNumber.replace(/\s/g, '').slice(-4)}`;
    await callOnboardingApi(paymentInfo);
  };

  const handleSkip = async () => {
    haptic('tap');
    setIsLoading(true);
    await callOnboardingApi('');
  };

  const isFormValid =
    cardNumber.replace(/\s/g, '').length >= 15 && expiryDate.length === 5 && cvc.length >= 3;

  const getCardBrand = () => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (/^62/.test(number)) return 'UnionPay';
    return null;
  };

  const cardBrand = getCardBrand();

  // Success State
  if (showSuccess) {
    return (
      <motion.div
        className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <motion.div
          className="relative flex flex-col items-center gap-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easings.smooth }}
        >
          {/* Success Icon */}
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, ...springs.bouncy }}
          >
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, ...springs.bouncy }}
              >
                <Check size={36} className="text-white" strokeWidth={1.5} />
              </motion.div>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border border-white/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-extralight tracking-wide">모든 준비 완료</h2>
            <p className="text-[13px] text-white/40 font-light tracking-wide">
              AI 스타일리스트가 준비되었습니다
            </p>
          </motion.div>

          <motion.div
            className="flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => {
              haptic('tap');
              navigate('/onboarding/step2');
            }}
            className="flex items-center gap-2 text-[13px] tracking-[0.02em] text-white/60 hover:text-white transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span className="font-light">뒤로</span>
          </motion.button>
          <ProgressIndicator currentStep={3} totalSteps={3} />
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 px-6">
        <div className="h-[1px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white/60 to-white"
            initial={{ width: '66%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, ease: easings.smooth }}
          />
        </div>
      </div>

      <main className="relative min-h-screen flex flex-col justify-center px-6 py-24">
        <motion.div
          className="max-w-[380px] mx-auto w-full"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easings.smooth, delay: 0.1 }}
        >
          {/* Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.p
              className="text-[13px] tracking-[0.08em] uppercase text-white/40 font-light mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              3단계 중 3단계
            </motion.p>
            <h1 className="text-[clamp(2rem,6vw,2.8rem)] font-extralight leading-[1.1] tracking-[-0.02em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: easings.smooth }}
              >
                결제
              </motion.span>
              <motion.span
                className="block text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}
              >
                수단
              </motion.span>
            </h1>
          </motion.div>

          {/* Card Preview - Glassmorphism */}
          <motion.div
            className="relative h-[180px] overflow-hidden rounded-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12]" />

            {/* Card pattern overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative h-full p-6 flex flex-col justify-between">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <CreditCard size={24} className="text-white/40" />
                <AnimatePresence mode="wait">
                  {cardBrand && (
                    <motion.span
                      key={cardBrand}
                      className="text-[11px] tracking-[0.1em] text-white/60 font-light uppercase"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                    >
                      {cardBrand}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Card number */}
              <div>
                <p className="font-mono text-[18px] tracking-[0.25em] text-white/80">
                  {cardNumber || '0000 0000 0000 0000'}
                </p>
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.15em] uppercase text-white/30 mb-1">카드 소유자</p>
                  <p className="text-[13px] uppercase tracking-[0.1em] text-white/60 font-light">
                    {cardHolder || '이름'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.15em] uppercase text-white/30 mb-1">유효기간</p>
                  <p className="text-[13px] tracking-[0.1em] text-white/60 font-light font-mono">
                    {expiryDate || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Card Number */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                카드 번호
              </label>
              <GlassInput
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onFocus={() => setFocusedField('cardNumber')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'cardNumber'}
                placeholder="0000 0000 0000 0000"
                className="font-mono tracking-[0.15em]"
                inputMode="numeric"
              />
            </motion.div>

            {/* Card Holder */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                카드 소유자
              </label>
              <GlassInput
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                onFocus={() => setFocusedField('cardHolder')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'cardHolder'}
                placeholder="이름을 입력하세요"
                className="uppercase tracking-[0.1em]"
              />
            </motion.div>

            {/* Expiry & CVC */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                  유효기간
                </label>
                <GlassInput
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  onFocus={() => setFocusedField('expiry')}
                  onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === 'expiry'}
                  placeholder="MM/YY"
                  className="font-mono"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                  CVC
                </label>
                <GlassInput
                  type="text"
                  value={cvc}
                  onChange={handleCvcChange}
                  onFocus={() => setFocusedField('cvc')}
                  onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === 'cvc'}
                  placeholder="000"
                  className="font-mono"
                  inputMode="numeric"
                />
              </div>
            </motion.div>

            {/* Security note */}
            <motion.div
              className="flex items-center gap-2 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Shield size={12} className="text-white/30" />
              <span className="text-[10px] tracking-wider text-white/30 font-light">
                종단 간 암호화로 보호됩니다
              </span>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={cn(
                  'group w-full py-4 rounded-xl',
                  'flex items-center justify-center gap-3',
                  'font-light tracking-[0.05em] text-[14px]',
                  'transition-all duration-300',
                  'backdrop-blur-xl border',
                  isFormValid && !isLoading
                    ? 'bg-white text-black border-white hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                    : 'bg-white/[0.05] text-white/30 border-white/[0.08] cursor-not-allowed'
                )}
                whileHover={isFormValid && !isLoading ? { scale: 1.01, y: -1 } : {}}
                whileTap={isFormValid && !isLoading ? { scale: 0.99 } : {}}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-[1.5px] border-black/20 border-t-black rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <span>설정 완료</span>
                    <motion.div
                      initial={{ x: 0, y: 0 }}
                      whileHover={{ x: 2, y: -2 }}
                      transition={springs.snappy}
                    >
                      <ArrowUpRight size={16} strokeWidth={1.5} />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Skip */}
          <motion.button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full mt-6 py-4 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors font-light disabled:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            나중에 추가
          </motion.button>
        </motion.div>
      </main>
    </motion.div>
  );
}
