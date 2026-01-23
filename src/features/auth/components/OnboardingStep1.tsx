import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, MapPin, User, Phone } from 'lucide-react';
import { useDaumPostcode } from '@/hooks';
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
  icon: Icon,
}: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  className?: string;
  icon?: React.ElementType;
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
          'relative backdrop-blur-xl rounded-xl border transition-all duration-300 flex items-center',
          isFocused
            ? 'bg-white/[0.08] border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
            : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
        )}
      >
        {Icon && (
          <div className="pl-4">
            <Icon size={18} className="text-white/30" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(
            'w-full bg-transparent px-4 py-4 text-[15px] font-light tracking-wide',
            'outline-none placeholder:text-white/30',
            Icon && 'pl-3',
            className
          )}
          placeholder={placeholder}
        />
      </div>
    </motion.div>
  );
}

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

export function OnboardingStep1() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleAddressComplete = useCallback((addr: string) => {
    setAddress(addr);
  }, []);

  const { openPostcode } = useDaumPostcode({
    onComplete: handleAddressComplete,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    haptic('tap');
    setIsLoading(true);

    const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;
    const profileData = { name, address: fullAddress, phone };
    localStorage.setItem('user_profile', JSON.stringify(profileData));

    await new Promise((resolve) => setTimeout(resolve, 300));
    haptic('success');
    navigate('/onboarding/step2');
  };

  const isFormValid = name.trim().length > 0;

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
              navigate('/signup');
            }}
            className="flex items-center gap-2 text-[13px] tracking-[0.02em] text-white/60 hover:text-white transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span className="font-light">Back</span>
          </motion.button>
          <ProgressIndicator currentStep={1} totalSteps={3} />
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 px-6">
        <div className="h-[1px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white/60 to-white"
            initial={{ width: '0%' }}
            animate={{ width: '33%' }}
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
              Step 1 of 3
            </motion.p>
            <h1 className="text-[clamp(2rem,6vw,2.8rem)] font-extralight leading-[1.1] tracking-[-0.02em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: easings.smooth }}
              >
                Basic
              </motion.span>
              <motion.span
                className="block text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}
              >
                Information
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
            {/* Name */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1 flex items-center gap-1">
                Name <span className="text-white/60">*</span>
              </label>
              <MagneticInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'name'}
                placeholder="Enter your name"
                icon={User}
              />
            </motion.div>

            {/* Address */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                Address
              </label>
              <motion.button
                type="button"
                onClick={() => {
                  haptic('tap');
                  openPostcode();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left',
                  'backdrop-blur-xl border transition-all duration-300',
                  'bg-white/[0.03] border-white/[0.08]',
                  'hover:bg-white/[0.05] hover:border-white/[0.12]'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <MapPin size={18} className="text-white/30" />
                <span className={cn(
                  'text-[15px] font-light tracking-wide',
                  address ? 'text-white' : 'text-white/30'
                )}>
                  {address || 'Search address'}
                </span>
              </motion.button>
              {address && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <MagneticInput
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    onFocus={() => setFocusedField('addressDetail')}
                    onBlur={() => setFocusedField(null)}
                    isFocused={focusedField === 'addressDetail'}
                    placeholder="Detail address"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light ml-1">
                Phone
              </label>
              <MagneticInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'phone'}
                placeholder="Phone number"
                icon={Phone}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                    <span>Continue</span>
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
            onClick={() => {
              haptic('tap');
              navigate('/onboarding/step2');
            }}
            className="w-full mt-6 py-4 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for now
          </motion.button>
        </motion.div>
      </main>
    </motion.div>
  );
}
