import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, Scan, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/cn';

// Editorial Image URLs
const EDITORIAL_IMAGES = {
  landing1: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing1.png',
  landing2: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing2.png',
  landing3: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing3.png',
  landing4: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing4.png',
  landing5: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing5.png',
  landing6: 'https://storage.googleapis.com/team_g_bucket_00310/video/landing6.png',
};

// Workflow Steps
const WORKFLOW_STEPS = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload',
    titleKr: '업로드',
    description: 'Drag & drop or capture any fashion image you like',
    descriptionKr: '원하는 패션 이미지를 업로드하세요',
  },
  {
    icon: Scan,
    number: '02',
    title: 'AI Analysis',
    titleKr: 'AI 분석',
    description: 'Our AI detects every item and analyzes style',
    descriptionKr: 'AI가 아이템을 감지하고 스타일을 분석합니다',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Find Matches',
    titleKr: '상품 매칭',
    description: 'Discover similar products from thousands of items',
    descriptionKr: '수천 개의 상품 중 비슷한 상품을 찾아드립니다',
  },
  {
    icon: Eye,
    number: '04',
    title: 'Virtual Try-On',
    titleKr: '가상 피팅',
    description: 'See how items look on you before purchasing',
    descriptionKr: '구매 전 가상 피팅으로 확인하세요',
  },
  {
    icon: ShoppingBag,
    number: '05',
    title: 'Shop',
    titleKr: '구매',
    description: 'Complete your purchase with one click',
    descriptionKr: '원클릭으로 구매를 완료하세요',
  },
];

// =============================================
// Main Landing Page Component
// =============================================
export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleEnter = useCallback(() => {
    navigate(isAuthenticated ? '/home' : '/login');
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Header */}
      <Header onEnter={handleEnter} isAuthenticated={isAuthenticated} isLoaded={isLoaded} />

      {/* Video Hero Section */}
      <VideoHeroSection isLoaded={isLoaded} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <CTASection onEnter={handleEnter} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// =============================================
// Header Component
// =============================================
function Header({
  onEnter,
  isAuthenticated,
  isLoaded,
}: {
  onEnter: () => void;
  isAuthenticated: boolean;
  isLoaded: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 px-6 py-5 transition-all duration-500 md:px-12',
        isScrolled ? 'border-b border-white/5 bg-black/80 backdrop-blur-xl' : 'bg-transparent'
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isLoaded ? 0 : -100, opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-xs font-medium tracking-[0.25em] text-white/80">DRESSENSE</span>
        <motion.button
          onClick={onEnter}
          className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-medium tracking-wide transition-all duration-300 hover:bg-white hover:text-black"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAuthenticated ? 'Enter' : 'Get Started'}
        </motion.button>
      </div>
    </motion.header>
  );
}

// =============================================
// Video Hero Section
// =============================================
function VideoHeroSection({ isLoaded }: { isLoaded: boolean }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <video autoPlay loop muted playsInline className="h-full w-full object-cover">
          <source
            src="https://storage.googleapis.com/team_g_bucket_00310/video/0121(3).mov"
            type="video/quicktime"
          />
          <source
            src="https://storage.googleapis.com/team_g_bucket_00310/video/0121(3).mov"
            type="video/mp4"
          />
        </video>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <motion.div
          className="h-12 w-px bg-gradient-to-b from-white/40 to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}

// =============================================
// How It Works Section - Editorial Magazine Style
// =============================================
function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Section intro - Animated text sequence */}
      <div className="relative flex min-h-[60vh] items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          onViewportEnter={() => {
            if (hasAnimated) return;
            setHasAnimated(true);
            // Start animation sequence
            const timings = [300, 1200, 2200];
            timings.forEach((time, index) => {
              setTimeout(() => setAnimationStep(index + 1), time);
            });
          }}
        >
          {/* Step 1: for your sense */}
          <motion.p
            className="text-lg tracking-[0.2em] text-white/50 mb-4 lowercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: animationStep >= 1 ? 1 : 0,
              y: animationStep >= 1 ? 0 : 20,
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            for your sense
          </motion.p>

          {/* Step 2: DRESSENSE - Logo reveal */}
          <motion.h1
            className="text-[clamp(3rem,15vw,12rem)] font-black tracking-[-0.03em] text-white"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{
              opacity: animationStep >= 2 ? 1 : 0,
              scale: animationStep >= 2 ? 1 : 0.8,
              filter: animationStep >= 2 ? 'blur(0px)' : 'blur(10px)',
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            DRESSENSE
          </motion.h1>

          {/* Step 3: 5단계로 당신만의 스타일을 */}
          <motion.p
            className="mt-12 text-[clamp(1.2rem,3vw,2rem)] font-light tracking-wide text-white/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: animationStep >= 3 ? 1 : 0,
              y: animationStep >= 3 ? 0 : 20,
            }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            5단계로 당신만의 스타일을 찾아보세요
          </motion.p>
        </motion.div>
      </div>

      {/* Workflow Steps - Editorial Layout */}
      <div className="relative">
        {WORKFLOW_STEPS.map((step, index) => (
          <EditorialStepItem key={step.number} step={step} index={index} />
        ))}
      </div>
    </section>
  );
}

// Individual step item with editorial layout
function EditorialStepItem({ step, index }: { step: (typeof WORKFLOW_STEPS)[0]; index: number }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start end', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -100 : 100, 0]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={itemRef}
      className={cn(
        'relative flex min-h-[50vh] items-center px-4 py-12 md:px-12',
        isEven ? 'justify-start' : 'justify-end'
      )}
      style={{ opacity }}
    >
      <motion.div
        className={cn('relative max-w-3xl', isEven ? 'ml-[5%] md:ml-[10%]' : 'mr-[5%] md:mr-[10%]')}
        style={{ x }}
      >
        {/* Large step number */}
        <motion.span
          className={cn(
            'absolute -top-20 text-[clamp(8rem,25vw,18rem)] font-extralight leading-none tracking-[-0.05em] text-white/[0.03]',
            isEven ? '-left-12' : '-right-12'
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {step.number}
        </motion.span>

        {/* Content */}
        <div className={cn('relative z-10', isEven ? 'text-left' : 'text-right')}>
          {/* Icon and title row */}
          <motion.div
            className={cn('mb-8 flex items-center gap-6', !isEven && 'flex-row-reverse')}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
              <step.icon size={32} className="text-white/60" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/30">
                Step {step.number}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="mb-6 text-[clamp(2.5rem,7vw,5rem)] font-medium leading-[1.1] tracking-[-0.02em]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-white">{step.titleKr}</span>
            <br />
            <span className="font-light text-white/30">{step.title}</span>
          </motion.h3>

          {/* Description */}
          <motion.p
            className="max-w-lg text-base font-medium leading-relaxed text-white/50 md:text-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {step.descriptionKr}
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className={cn('mt-8 flex items-center gap-4', !isEven && 'flex-row-reverse')}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ transformOrigin: isEven ? 'left' : 'right' }}
          >
            <span className="h-px w-16 bg-gradient-to-r from-white/30 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              {step.description.split(' ').slice(0, 3).join(' ')}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating image for all steps */}
      <motion.div
        className={cn(
          'absolute z-0 w-[40%] md:w-[30%]',
          isEven ? 'right-[5%]' : 'left-[5%]',
          index === 0 && 'top-[15%]',
          index === 1 && 'bottom-[10%]',
          index === 2 && 'top-[25%]',
          index === 3 && 'top-[20%]',
          index === 4 && 'bottom-[15%]'
        )}
        initial={{ opacity: 0, y: 50, rotate: isEven ? 5 : -5 }}
        whileInView={{ opacity: 0.7, y: 0, rotate: isEven ? 3 : -3 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="overflow-hidden border border-white/10">
          <img
            src={Object.values(EDITORIAL_IMAGES)[index]}
            alt="Fashion"
            className="h-auto w-full object-cover opacity-70"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================
// CTA Section
// =============================================
function CTASection({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center px-6 py-24">
      {/* Decorative circle */}
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full border border-white/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full border border-white/[0.03]"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.p
          className="mb-4 text-sm uppercase tracking-[0.3em] text-white/40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Ready to start?
        </motion.p>
        <h2 className="mb-6 text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[-0.02em] text-white">
          당신만의 스타일을 찾아보세요
        </h2>
        <p className="mb-10 text-base text-white/40">
          AI 스타일리스트가 기다리고 있습니다
        </p>
        <motion.button
          onClick={onEnter}
          className="rounded-full border border-white/30 bg-white px-12 py-4 text-base font-medium tracking-wide text-black transition-all duration-300 hover:bg-white/90"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          시작하기
        </motion.button>
      </motion.div>
    </section>
  );
}

// =============================================
// Footer
// =============================================
function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <span className="text-xs tracking-[0.2em] text-white/40">DRESSENSE</span>
        <div className="flex items-center gap-8 text-xs text-white/30">
          <a href="#" className="transition-colors hover:text-white/60">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-white/60">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-white/60">
            Contact
          </a>
        </div>
        <span className="text-xs text-white/20">2025 Dressense</span>
      </div>
    </footer>
  );
}
