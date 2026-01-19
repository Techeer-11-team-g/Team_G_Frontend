import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput, LoadingButton, AnimatedBackground } from '@/components/ui';
import { useFieldFocus } from '@/hooks';
import { authApi, usersApi } from '@/api';
import { useAuthStore, useUserStore } from '@/store';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const setUser = useUserStore((state) => state.setUser);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isFocused, getFieldProps } = useFieldFocus<'username' | 'password'>();

  const isFormValid = username.length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const response = await authApi.login({ username, password });

      // 토큰 저장
      login({ user_id: 0, username, email: '' }, response.access, response.refresh);

      // 사용자 프로필 조회 및 저장
      try {
        const userProfile = await usersApi.getProfile();
        setUser(userProfile);
      } catch {
        // 프로필 조회 실패해도 로그인은 성공
        console.log('Profile fetch failed, but login succeeded');
      }

      toast.success('로그인 성공!');
      navigate('/home');
    } catch (error: any) {
      const message = error.response?.data?.detail || '로그인에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
              <LogIn size={24} className="text-black/60" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="text-[13px] text-black/50">다시 만나서 반가워요</p>
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
              {...getFieldProps('username')}
            />

            {/* Password */}
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
                loadingText="로그인 중..."
                disabled={!isFormValid}
              >
                로그인
              </LoadingButton>
            </div>
          </form>

          {/* SignUp Link */}
          <p className="animate-in fade-in text-center text-[13px] text-black/50 delay-300 duration-700">
            계정이 없으신가요?{' '}
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
