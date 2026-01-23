import { useRef } from 'react';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeaturesSection } from './FeaturesSection';

// =============================================
// Landing Intro - Complete Service Introduction
// Monochrome, minimal, elegant design
// Combines Hero, How It Works, and Features
// =============================================

export function LandingIntro() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
