import FeaturesHero from "@components/layout/marketing/features/FeaturesHero";
import CoreFeaturesSection from "@components/layout/marketing/features/CoreFeaturesSection";
import CollaborationSection from "@components/layout/marketing/features/CollaborationSection";
import ProductivitySection from "@components/layout/marketing/features/ProductivitySection";
import SecuritySection from "@components/layout/marketing/features/SecuritySection";
import TechnologySection from "@components/layout/marketing/features/TechnologySection";
import FeaturesCTA from "@components/layout/marketing/features/FeaturesCTA";
import { LandingBackground } from "@/features/landing/LandingBackground";

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
      {/* Shared ambient background — same as the landing page */}
      <LandingBackground />

      <main className="relative z-0">
        <FeaturesHero />
        <CoreFeaturesSection />
        <CollaborationSection />
        <ProductivitySection />
        <SecuritySection />
        <TechnologySection />
        <FeaturesCTA />
      </main>
    </div>
  );
}
