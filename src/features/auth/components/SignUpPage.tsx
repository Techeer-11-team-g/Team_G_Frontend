import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';

// Magnetic Input Component
function MagneticInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
  isFocused,
  className,
  children,
}: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.05;
    const deltaY = (e.clientY - centerY) * 0.08;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={inputRef}
      className="relative"
      style={{ x: xSpring, y: ySpring }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 pointer-events-none',
          'bg-gradient-to-r from-white/5 via-white/10 to-white/5'
        )}
        animate={{
          opacity: isFocused ? 1 : 0,
          scale: isFocused ? 1 : 0.98,
        }}
        transition={{ duration: 0.2 }}
      />
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
          className={cn(
            'w-full bg-transparent px-5 py-4 text-[15px] font-light tracking-wide',
            'outline-none placeholder:text-white/30',
            className
          )}
          placeholder={placeholder}
        />
        {children}
      </div>
    </motion.div>
  );
}

// Validation Badge Component
function ValidationBadge({ isValid, validText, invalidText }: { isValid: boolean; validText: string; invalidText: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'text-[10px] tracking-[0.15em] uppercase font-light',
        isValid ? 'text-emerald-400/80' : 'text-white/30'
      )}
    >
      {isValid ? validText : invalidText}
    </motion.span>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isUsernameValid = username.length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordMatch = password === passwordConfirm && passwordConfirm.length > 0;

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, label: '약함' };
    if (strength <= 2) return { level: 2, label: '보통' };
    if (strength <= 3) return { level: 3, label: '좋음' };
    return { level: 4, label: '강함' };
  };

  const passwordStrength = getPasswordStrength();
  const isFormValid =
    username &&
    email &&
    password &&
    passwordConfirm &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    haptic('tap');
    setIsLoading(true);

    try {
      const response = await authApi.register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      login(response.user, response.tokens.access, response.tokens.refresh);
      localStorage.setItem('user_email', response.user.email);

      haptic('success');
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate('/onboarding/step1');
    } catch (error: unknown) {
      haptic('error');
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || '회원가입에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full border border-white/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-extralight tracking-wide">환영합니다</h2>
            <p className="text-[13px] text-white/40 font-light tracking-wide">
              맞춤 경험을 준비하고 있습니다
            </p>
          </motion.div>

          {/* Loading dots */}
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
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
              navigate('/');
            }}
            className="flex items-center gap-2 text-[13px] tracking-[0.02em] text-white/60 hover:text-white transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span className="font-light">뒤로</span>
          </motion.button>
          <span className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-light">
            Dressense
          </span>
        </div>
      </motion.header>

      <main className="relative min-h-screen flex flex-col justify-center px-6 py-28">
        <motion.div
          className="max-w-[380px] mx-auto w-full"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easings.smooth, delay: 0.1 }}
        >
          {/* Title */}
          <motion.div
            className="mb-10"
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
              새로운 패션 경험
            </motion.p>
            <h1 className="text-[clamp(2.2rem,7vw,3.2rem)] font-extralight leading-[1.05] tracking-[-0.02em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: easings.smooth }}
              >
                계정을
              </motion.span>
              <motion.span
                className="block text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}
              >
                만들어보세요
              </motion.span>
            </h1>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Username */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
                  사용자 이름
                </label>
                {username && (
                  <ValidationBadge isValid={isUsernameValid} validText="유효" invalidText="3자 이상" />
                )}
              </div>
              <MagneticInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'username'}
                placeholder="사용자 이름을 선택하세요"
              />
            </motion.div>

            {/* Email */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
                  이메일
                </label>
                {email && (
                  <ValidationBadge isValid={isEmailValid} validText="유효" invalidText="유효하지 않음" />
                )}
              </div>
              <MagneticInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'email'}
                placeholder="이메일을 입력하세요"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
                  비밀번호
                </label>
                {password && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'text-[10px] tracking-[0.15em] uppercase font-light',
                      passwordStrength.level >= 3 ? 'text-emerald-400/80' : 'text-white/30'
                    )}
                  >
                    {passwordStrength.label}
                  </motion.span>
                )}
              </div>
              <MagneticInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'password'}
                placeholder="비밀번호를 입력하세요"
                className="pr-16"
              >
                <button
                  type="button"
                  onClick={() => {
                    haptic('tap');
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tracking-wider uppercase text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? '숨기기' : '보기'}
                </button>
              </MagneticInput>
              {/* Password strength bar */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    className="flex gap-1 pt-1 px-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {[1, 2, 3, 4].map((level) => {
                      const getStrengthColor = () => {
                        if (level > passwordStrength.level) return 'bg-white/[0.08]';
                        if (passwordStrength.level <= 1) return 'bg-red-400/60';
                        if (passwordStrength.level === 2) return 'bg-amber-400/60';
                        if (passwordStrength.level === 3) return 'bg-blue-400/60';
                        return 'bg-emerald-400/60';
                      };
                      return (
                        <motion.div
                          key={level}
                          className={cn(
                            'h-[2px] flex-1 rounded-full transition-colors duration-300',
                            getStrengthColor()
                          )}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: level * 0.05 }}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Confirm */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
                  비밀번호 확인
                </label>
                {passwordConfirm && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'text-[10px] tracking-[0.15em] uppercase font-light',
                      isPasswordMatch ? 'text-emerald-400/80' : 'text-red-400/80'
                    )}
                  >
                    {isPasswordMatch ? '일치' : '불일치'}
                  </motion.span>
                )}
              </div>
              <MagneticInput
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onFocus={() => setFocusedField('passwordConfirm')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'passwordConfirm'}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="pt-4"
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
                    <span>시작하기</span>
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

          {/* Login Link */}
          <motion.div
            className="mt-10 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
            <p className="text-[13px] text-white/40 font-light tracking-wide text-center">
              이미 계정이 있으신가요?{' '}
              <motion.button
                onClick={() => {
                  haptic('tap');
                  navigate('/login');
                }}
                className="text-white hover:text-white/70 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                로그인
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
