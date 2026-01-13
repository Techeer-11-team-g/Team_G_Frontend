import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { FormInput, LoadingButton, AnimatedBackground } from '@/components/ui';
import { useFieldFocus } from '@/hooks';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isFocused, getFieldProps } = useFieldFocus<'email' | 'password'>();

  const isFormValid = email && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem('user_email', email);
    localStorage.setItem('is_logged_in', 'true');

    toast.success('환영합니다!', {
      description: '로그인되었습니다',
    });

    navigate('/home');
  };

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
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="text-[13px] text-black/50">다시 만나서 반가워요</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-in fade-in slide-in-from-bottom-5 space-y-5 delay-150 duration-700"
          >
            <FormInput
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              isFocused={isFocused('email')}
              {...getFieldProps('email')}
            />

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

            <div className="pt-2">
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!isFormValid}
              >
                로그인
              </LoadingButton>
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
