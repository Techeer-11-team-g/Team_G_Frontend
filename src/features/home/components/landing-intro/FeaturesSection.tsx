import { memo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Clock, Camera, Sparkles, Users, TrendingUp, Heart, Bookmark } from 'lucide-react';
import type { FeaturePointProps } from './types';

export const FeaturesSection = memo(function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-20 md:py-28 px-6"
      style={{ opacity }}
    >
      {/* Section Header */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-white/30 text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4">
          Explore More
        </p>
        <h2 className="text-2xl md:text-4xl font-extralight text-white mb-4">
          Discover & Manage
        </h2>
        <p className="text-white/40 text-sm md:text-base font-light max-w-md mx-auto">
          Browse community styles and track your fashion journey.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6">
        <FeedFeatureCard />
        <HistoryFeatureCard />
      </div>

      {/* Final CTA */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-white/25 text-xs">
          Ready to start? Scroll up and upload an image above.
        </p>
      </motion.div>
    </motion.section>
  );
});

const FeedFeatureCard = memo(function FeedFeatureCard() {
  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      onClick={() => {
        const feedSection = document.querySelector('[data-section="feed"]');
        if (feedSection) {
          feedSection.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      <motion.div
        className="relative p-6 md:p-8 rounded-2xl h-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        whileHover={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <Compass size={22} className="text-white/60" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-light text-white/90 mb-2">
          Style Feed
        </h3>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-5">
          Explore outfit inspirations from the community. Discover trending styles and get inspired.
        </p>

        {/* Feature Points */}
        <div className="space-y-2">
          <FeaturePoint icon={Users} text="Community looks" />
          <FeaturePoint icon={TrendingUp} text="Weekly trends" />
          <FeaturePoint icon={Heart} text="Save favorites" />
        </div>

        {/* Arrow */}
        <motion.div
          className="absolute bottom-6 right-6 text-white/20"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

const HistoryFeatureCard = memo(function HistoryFeatureCard() {
  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onClick={() => {
        window.location.href = '/history';
      }}
    >
      <motion.div
        className="relative p-6 md:p-8 rounded-2xl h-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        whileHover={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <Clock size={22} className="text-white/60" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-light text-white/90 mb-2">
          My History
        </h3>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-5">
          Track your style journey. View past analyses, revisit try-ons, and manage your history.
        </p>

        {/* Feature Points */}
        <div className="space-y-2">
          <FeaturePoint icon={Camera} text="Uploaded images" />
          <FeaturePoint icon={Sparkles} text="AI analyses" />
          <FeaturePoint icon={Bookmark} text="Saved try-ons" />
        </div>

        {/* Arrow */}
        <motion.div
          className="absolute bottom-6 right-6 text-white/20"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

const FeaturePoint = memo(function FeaturePoint({ icon: Icon, text }: FeaturePointProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <Icon size={12} className="text-white/40" strokeWidth={1.5} />
      </div>
      <span className="text-white/50 text-xs">{text}</span>
    </div>
  );
});
