import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Clock, Users, TrendingUp, Heart, Bookmark } from 'lucide-react';

// =============================================
// Features Section - Feed & History
// Showcases community features and personal history
// =============================================

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-6">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.02) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4">
            Explore More
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
            Discover & Manage
          </h2>
          <p className="text-white/50 text-base md:text-lg font-light max-w-xl mx-auto">
            Browse community styles and track your fashion journey.
          </p>
        </motion.div>

        {/* Feature Cards - Two Column */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Feed Feature */}
          <motion.div
            className="group cursor-pointer"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => {
              // Scroll to feed section
              const feedSection = document.querySelector('[data-section="feed"]');
              if (feedSection) {
                feedSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div
              className="relative p-8 md:p-10 rounded-3xl h-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-48 h-48 opacity-30">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>

              {/* Icon */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Compass size={24} className="text-white/80" strokeWidth={1.5} />
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-light text-white mb-3">
                Style Feed
              </h3>

              {/* Description */}
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-6">
                Explore outfit inspirations from the community. Discover trending styles, save your favorites, and get inspired by real looks.
              </p>

              {/* Feature Points */}
              <div className="space-y-3">
                <FeaturePoint icon={Users} text="Community-curated looks" />
                <FeaturePoint icon={TrendingUp} text="Trending styles weekly" />
                <FeaturePoint icon={Heart} text="Save favorites for later" />
              </div>

              {/* Hover Indicator */}
              <motion.div
                className="mt-8 flex items-center gap-2 text-white/40 text-sm"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span>Scroll to explore</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* History Feature */}
          <motion.div
            className="group cursor-pointer"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => navigate('/history')}
          >
            <div
              className="relative p-8 md:p-10 rounded-3xl h-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-48 h-48 opacity-30">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
              </div>

              {/* Icon */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.05, rotate: -5 }}
              >
                <Clock size={24} className="text-white/80" strokeWidth={1.5} />
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-light text-white mb-3">
                My History
              </h3>

              {/* Description */}
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-6">
                Track your style journey. View past analyses, revisit try-ons, and manage your shopping history all in one place.
              </p>

              {/* Feature Points */}
              <div className="space-y-3">
                <FeaturePoint icon={Camera} text="All your uploaded images" />
                <FeaturePoint icon={Sparkles} text="Past AI analyses" />
                <FeaturePoint icon={Bookmark} text="Saved try-on results" />
              </div>

              {/* Hover Indicator */}
              <motion.div
                className="mt-8 flex items-center gap-2 text-white/40 text-sm"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <span>View history</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =============================================
// Feature Point Component
// =============================================
function FeaturePoint({ icon: Icon, text }: { icon: typeof Compass; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <Icon size={14} className="text-white/50" strokeWidth={1.5} />
      </div>
      <span className="text-white/60 text-sm">{text}</span>
    </div>
  );
}

// Import icons used in FeaturePoint
import { Camera, Sparkles } from 'lucide-react';
