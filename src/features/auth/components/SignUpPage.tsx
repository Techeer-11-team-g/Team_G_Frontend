import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 이메일 유효성 검사
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 강도 계산
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
  const isFormValid = email && password && isEmailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    setShowSuccess(true);
    localStorage.setItem('user_email', email);
    localStorage.setItem('is_logged_in', 'true');

    await new Promise((resolve) => setTimeout(resolve, 1200));
    navigate('/onboarding/step1');
  };

  // 성공 화면
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center animate-bounce">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">환영합니다!</h2>
            <p className="text-black/50 text-[14px]">프로필을 설정해볼까요?</p>
          </div>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-black animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Header */}
      <header className="relative w-full px-6 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="font-serif text-3xl font-bold tracking-tighter">Dres:sense</h2>
          <span className="text-[8px] uppercase tracking-widest font-black opacity-30 italic">
            AI Fashion Studio
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 max-w-md mx-auto w-full px-6 py-8 flex flex-col justify-center">
        <div className="space-y-8">
          {/* Title with Icon */}
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black/5 mb-2">
              <Sparkles size={24} className="text-black/60" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
            <p className="text-[13px] text-black/50">새로운 패션 경험을 시작하세요</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150"
          >
            {/* Email Input */}
            <div className="space-y-2">
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === 'email' ? 'scale-[1.02]' : ''
                }`}
              >
                <Mail
                  size={18}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-black' : 'text-black/30'
                  }`}
                />
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full bg-white border-2 pl-14 pr-12 py-4 text-[14px] rounded-2xl outline-none transition-all duration-300 ${
                    focusedField === 'email'
                      ? 'border-black shadow-lg shadow-black/5'
                      : email && isEmailValid
                        ? 'border-green-400'
                        : email && !isEmailValid
                          ? 'border-red-300'
                          : 'border-black/10'
                  }`}
                />
                {email && (
                  <div
                    className={`absolute right-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      isEmailValid ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
              {email && !isEmailValid && (
                <p className="text-[11px] text-red-400 pl-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  올바른 이메일 형식을 입력해주세요
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === 'password' ? 'scale-[1.02]' : ''
                }`}
              >
                <Lock
                  size={18}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-black' : 'text-black/30'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full bg-white border-2 pl-14 pr-14 py-4 text-[14px] rounded-2xl outline-none transition-all duration-300 ${
                    focusedField === 'password'
                      ? 'border-black shadow-lg shadow-black/5'
                      : 'border-black/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : 'bg-transparent'
                          }`}
                          style={{
                            transitionDelay: `${level * 50}ms`,
                          }}
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

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className={`w-full transition-all duration-300 ${
                  isFormValid
                    ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20'
                    : 'opacity-50'
                }`}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>잠시만요...</span>
                  </div>
                ) : (
                  '시작하기'
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-[13px] text-black/50 animate-in fade-in duration-700 delay-300">
            이미 계정이 있으신가요?{' '}
            <button className="font-semibold text-black hover:underline transition-all hover:tracking-wide">
              로그인
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center">
        <p className="text-[9px] uppercase tracking-widest font-black text-black/10">
          Dres:sense v1.0.0
        </p>
      </footer>
    </div>
  );
}
