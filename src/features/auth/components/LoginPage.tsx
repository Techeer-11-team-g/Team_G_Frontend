import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFormValid = email && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem('user_email', email);
    localStorage.setItem('is_logged_in', 'true');

    navigate('/home');
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl" />
        <div
          className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

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
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="text-[13px] text-black/50">다시 만나서 반가워요</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-in fade-in slide-in-from-bottom-5 space-y-5 delay-150 duration-700"
          >
            {/* Email Input */}
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
                className={`w-full rounded-2xl border-2 bg-white py-4 pl-14 pr-5 text-[14px] outline-none transition-all duration-300 ${
                  focusedField === 'email'
                    ? 'border-black shadow-lg shadow-black/5'
                    : 'border-black/10'
                }`}
              />
            </div>

            {/* Password Input */}
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
                className={`w-full rounded-2xl border-2 bg-white py-4 pl-14 pr-14 text-[14px] outline-none transition-all duration-300 ${
                  focusedField === 'password'
                    ? 'border-black shadow-lg shadow-black/5'
                    : 'border-black/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 transition-all duration-200 hover:scale-110 hover:text-black/60 active:scale-95"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>잠시만요...</span>
                  </div>
                ) : (
                  '로그인'
                )}
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="animate-in fade-in text-center text-[13px] text-black/50 delay-300 duration-700">
            아직 계정이 없으신가요?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold text-black transition-all hover:tracking-wide hover:underline"
            >
              회원가입
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
