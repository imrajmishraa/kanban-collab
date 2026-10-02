import { lazy } from "react";

import HowItWorksHero from "@components/layout/marketing/howItWorks/HowItWorksHero";
import DeferredSection from "@components/layout/marketing/DeferredSection";

const WorkflowOverviewSection = lazy(
  () =>
    import("@components/layout/marketing/howItWorks/WorkflowOverviewSection"),
);
const StepOneSection = lazy(
  () => import("@components/layout/marketing/howItWorks/StepOneSection"),
);
const StepTwoSection = lazy(
  () => import("@components/layout/marketing/howItWorks/StepTwoSection"),
);
const StepThreeSection = lazy(
  () => import("@components/layout/marketing/howItWorks/StepThreeSection"),
);
const CollaborationFlowSection = lazy(
  () =>
    import("@components/layout/marketing/howItWorks/CollaborationFlowSection"),
);
const HowItWorksCTA = lazy(
  () => import("@components/layout/marketing/howItWorks/HowItWorksCTA"),
);

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
      <main className="relative z-0">
        {/* Eager — above the fold, never waits on a chunk */}
        <HowItWorksHero />

        {/* Lazy *and* deferred — each chunk is only requested once its
            section is ~600px from the viewport, so nothing below the
            fold competes with the hero's first paint. */}
        <DeferredSection>
          <WorkflowOverviewSection />
        </DeferredSection>

        <DeferredSection>
          <StepOneSection />
        </DeferredSection>

        <DeferredSection>
          <StepTwoSection />
        </DeferredSection>

        <DeferredSection>
          <StepThreeSection />
        </DeferredSection>

        <DeferredSection>
          <CollaborationFlowSection />
        </DeferredSection>

        <DeferredSection>
          <HowItWorksCTA />
        </DeferredSection>
      </main>
    </div>
  );
}
