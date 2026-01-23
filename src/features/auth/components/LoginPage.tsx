import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';
import { authApi, usersApi } from '@/api';
import { useAuthStore, useUserStore } from '@/store';
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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const setUser = useUserStore((state) => state.setUser);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFormValid = username.length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    haptic('tap');
    setIsLoading(true);

    try {
      const response = await authApi.login({ username, password });
      login({ user_id: 0, username, email: '' }, response.access, response.refresh);

      try {
        const userProfile = await usersApi.getProfile();
        setUser(userProfile);
      } catch {
        console.log('Profile fetch failed, but login succeeded');
      }

      haptic('success');
      toast.success('Welcome back');
      navigate('/home');
    } catch (error: any) {
      haptic('error');
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google 로그인에 실패했습니다');
      return;
    }

    setIsLoading(true);
    haptic('tap');

    try {
      const response = await authApi.googleLogin({
        credential: credentialResponse.credential,
      });

      login(
        { user_id: response.user.user_id, username: response.user.username, email: response.user.email },
        response.access,
        response.refresh
      );

      try {
        const userProfile = await usersApi.getProfile();
        setUser(userProfile);
      } catch {
        console.log('Profile fetch failed, but login succeeded');
      }

      haptic('success');
      toast.success('Google 로그인 성공');

      // 신규 사용자면 온보딩으로, 기존 사용자면 홈으로
      if (response.is_new_user) {
        navigate('/onboarding/step1');
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      haptic('error');
      const message = error.response?.data?.detail || 'Google 로그인에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="font-light">Back</span>
          </motion.button>
          <span className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-light">
            Dressense
          </span>
        </div>
      </motion.header>

      <main className="relative min-h-screen flex flex-col justify-center px-6 py-24">
        <motion.div
          className="max-w-[380px] mx-auto w-full"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easings.smooth, delay: 0.1 }}
        >
          {/* Agent Greeting */}
          <motion.div
            className="mb-12"
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
              Welcome back
            </motion.p>
            <h1 className="text-[clamp(2.2rem,7vw,3.2rem)] font-extralight leading-[1.05] tracking-[-0.02em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: easings.smooth }}
              >
                Sign in to
              </motion.span>
              <motion.span
                className="block text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}
              >
                continue
              </motion.span>
            </h1>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Username */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                Username
              </label>
              <MagneticInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'username'}
                placeholder="Enter your username"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                Password
              </label>
              <MagneticInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'password'}
                placeholder="Enter your password"
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </MagneticInput>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
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
                    <span>Sign In</span>
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

            {/* Divider */}
            <motion.div
              className="flex items-center gap-4 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-white/30 font-light">or</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
            </motion.div>

            {/* Google Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pt-4"
            >
              <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:!w-full">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    haptic('error');
                    toast.error('Google 로그인에 실패했습니다');
                  }}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </motion.div>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            className="mt-12 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
            <p className="text-[13px] text-white/40 font-light tracking-wide text-center">
              New to Dressense?{' '}
              <motion.button
                onClick={() => {
                  haptic('tap');
                  navigate('/signup');
                }}
                className="text-white hover:text-white/70 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create account
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 px-6 py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-white/20 font-light">
          <span>2025</span>
          <span className="uppercase">AI Fashion Agent</span>
        </div>
      </motion.footer>
    </motion.div>
  );
}
