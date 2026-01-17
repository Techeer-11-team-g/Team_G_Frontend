import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput, LoadingButton, AnimatedBackground } from '@/components/ui';
import { useFieldFocus } from '@/hooks';
import { authApi } from '@/api';
import { useAuthStore } from '@/store';

export function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { isFocused, getFieldProps } = useFieldFocus<
    'username' | 'email' | 'password' | 'passwordConfirm'
  >();

  const isUsernameValid = username.length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordMatch = password === passwordConfirm && passwordConfirm.length > 0;

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, label: '약함', color: 'bg-red-400' };
    if (strength <= 2) return { level: 2, label: '보통', color: 'bg-yellow-400' };
    if (strength <= 3) return { level: 3, label: '좋음', color: 'bg-blue-400' };
    return { level: 4, label: '강력', color: 'bg-green-500' };
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

    setIsLoading(true);

    try {
      const response = await authApi.register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      // 토큰과 유저 정보 저장
      login(response.user, response.tokens.access, response.tokens.refresh);

      // 온보딩용 이메일 저장
      localStorage.setItem('user_email', response.user.email);

      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      navigate('/onboarding/step1');
    } catch (error: any) {
      const message = error.response?.data?.detail || '회원가입에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 화면
  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="animate-in zoom-in-50 fade-in flex flex-col items-center gap-6 duration-500">
          <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-black">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">환영합니다!</h2>
            <p className="text-[14px] text-black/50">프로필을 설정해볼까요?</p>
          </div>
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-pulse rounded-full bg-black"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative flex w-full items-center justify-center px-6 py-8">
        <div className="animate-in fade-in slide-in-from-top-4 flex flex-col items-center duration-700">
          <h2 className="font-serif text-3xl font-bold tracking-tighter">Dres:sense</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="space-y-8">
          {/* Title with Icon */}
          <div className="animate-in fade-in slide-in-from-bottom-5 space-y-3 text-center duration-700">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5">
              <Sparkles size={24} className="text-black/60" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
            <p className="text-[13px] text-black/50">새로운 패션 경험을 시작하세요</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-in fade-in slide-in-from-bottom-5 space-y-4 delay-150 duration-700"
          >
            {/* Username */}
            <FormInput
              type="text"
              placeholder="사용자 아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={18} />}
              isFocused={isFocused('username')}
              isValid={username ? isUsernameValid : undefined}
              isInvalid={username ? !isUsernameValid : undefined}
              error={username && !isUsernameValid ? '3자 이상 입력해주세요' : undefined}
              rightIcon={
                username && isUsernameValid ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                ) : undefined
              }
              {...getFieldProps('username')}
            />

            {/* Email */}
            <FormInput
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              isFocused={isFocused('email')}
              isValid={email ? isEmailValid : undefined}
              isInvalid={email ? !isEmailValid : undefined}
              error={email && !isEmailValid ? '올바른 이메일 형식을 입력해주세요' : undefined}
              rightIcon={
                email && isEmailValid ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                ) : undefined
              }
              {...getFieldProps('email')}
            />

            {/* Password */}
            <div className="space-y-3">
              <FormInput
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                isFocused={isFocused('password')}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-black/30 transition-all duration-200 hover:scale-110 hover:text-black/60 active:scale-95"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...getFieldProps('password')}
              />

              {password && (
                <div className="animate-in fade-in slide-in-from-top-2 px-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-black/5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : 'bg-transparent'
                          }`}
                          style={{ transitionDelay: `${level * 50}ms` }}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[11px] font-semibold transition-colors duration-300 ${
                        passwordStrength.level <= 1
                          ? 'text-red-400'
                          : passwordStrength.level === 2
                            ? 'text-yellow-500'
                            : passwordStrength.level === 3
                              ? 'text-blue-500'
                              : 'text-green-500'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Confirm */}
            <FormInput
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              icon={<Lock size={18} />}
              isFocused={isFocused('passwordConfirm')}
              isValid={passwordConfirm ? isPasswordMatch : undefined}
              isInvalid={passwordConfirm ? !isPasswordMatch : undefined}
              error={
                passwordConfirm && !isPasswordMatch ? '비밀번호가 일치하지 않습니다' : undefined
              }
              rightIcon={
                passwordConfirm ? (
                  isPasswordMatch ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="text-black/30 transition-all duration-200 hover:scale-110 hover:text-black/60 active:scale-95"
                    >
                      {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )
                ) : undefined
              }
              {...getFieldProps('passwordConfirm')}
            />

            <div className="pt-2">
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="잠시만요..."
                disabled={!isFormValid}
              >
                시작하기
              </LoadingButton>
            </div>
          </form>

          {/* Login Link */}
          <p className="animate-in fade-in text-center text-[13px] text-black/50 delay-300 duration-700">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-black transition-all hover:tracking-wide hover:underline"
            >
              로그인
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-black/10">
          Dres:sense v1.0.0
        </p>
      </footer>
    </div>
  );
}
