import { lazy } from "react";

import { HeroSection } from "@/features/marketing";
const WhyKanbanSection = lazy(
  () => import("@/features/marketing/components/landing/WhyKanbanSection"),
);
const HowItWorksSection = lazy(
  () => import("@/features/marketing/components/landing/HowItWorksSection"),
);
const CollaborationSection = lazy(
  () => import("@/features/marketing/components/landing/CollaborationSection"),
);
const OpenSourceSection = lazy(
  () => import("@/features/marketing/components/landing/OpenSourceSection"),
);

const FaqSection = lazy(
  () => import("@/features/marketing/components/landing/FaqSection"),
);
const CtaSection = lazy(
  () => import("@/features/marketing/components/landing/CtaSection"),
);

/* NOTE: <LandingBackground /> moved into PublicLayout so every public
   route shares the same depth field. Remove any local import of it. */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-(--text-primary)">
      <main className="relative z-0">
        <HeroSection />

        <WhyKanbanSection />

        <HowItWorksSection />

        <CollaborationSection />

        <OpenSourceSection />

        <FaqSection />

        <CtaSection />
      </main>
    </div>
  );
}
