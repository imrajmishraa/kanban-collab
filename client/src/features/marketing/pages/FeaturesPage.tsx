import React from "react";

import CollaborationSection from "@components/layout/marketing/features/CollaborationSection";
import FeaturesCTA from "@components/layout/marketing/features/FeaturesCTA";
import FeaturesHero from "@components/layout/marketing/features/FeaturesHero";
import ProductivitySection from "@components/layout/marketing/features/ProductivitySection";
import SecuritySection from "@components/layout/marketing/features/SecuritySection";
import TechnologySection from "@components/layout/marketing/features/TechnologySection";
import CoreFeaturesSection from "#components/layout/marketing/features/CoreFeaturesSection";



export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-12 text-neutral-100 sm:px-6 sm:py-16">
      <FeaturesHero />
      <CoreFeaturesSection />
      <CollaborationSection />
      <ProductivitySection />
      <SecuritySection />
      <TechnologySection />
      <FeaturesCTA />
    </main>
  );
}
