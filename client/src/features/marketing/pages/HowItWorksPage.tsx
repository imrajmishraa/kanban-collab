

import HowItWorksHero from "@components/layout/marketing/howItWorks/HowItWorksHero";
import WorkflowOverviewSection from "@components/layout/marketing/howItWorks/WorkflowOverviewSection";
import StepOneSection from "@components/layout/marketing/howItWorks/StepOneSection";
import StepTwoSection from "@components/layout/marketing/howItWorks/StepTwoSection";
import StepThreeSection from "@components/layout/marketing/howItWorks/StepThreeSection";
import CollaborationFlowSection from "@components/layout/marketing/howItWorks/CollaborationFlowSection";
import HowItWorksCTA from "@components/layout/marketing/howItWorks/HowItWorksCTA";
import { LandingBackground } from "@/features/landing/LandingBackground";

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
      {/* Shared ambient background — same as landing + features pages */}
      <LandingBackground />

      <main className="relative z-0">
        <HowItWorksHero />
        <WorkflowOverviewSection />
        <StepOneSection />
        <StepTwoSection />
        <StepThreeSection />
        <CollaborationFlowSection />
        <HowItWorksCTA />
      </main>
    </div>
  );
}
