import { lazy } from "react";

import HeroSection from "@components/layout/landing/HeroSection";
const WhyKanbanSection = lazy(
  () => import("@components/layout/landing/WhyKanbanSection"),
);
const HowItWorksSection = lazy(
  () => import("@components/layout/landing/HowItWorksSection"),
);
const CollaborationSection = lazy(
  () => import("@components/layout/landing/CollaborationSection"),
);
const OpenSourceSection = lazy(
  () => import("@components/layout/landing/OpenSourceSection"),
);

const FaqSection = lazy(() => import("@components/layout/landing/FaqSection"));
const CtaSection = lazy(() => import("@components/layout/landing/CtaSection"));

/* NOTE: <LandingBackground /> moved into PublicLayout so every public
   route shares the same depth field. Remove any local import of it. */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
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
