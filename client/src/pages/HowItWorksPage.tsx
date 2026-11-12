import { lazy } from "react";

import { HowItWorksHero } from "@/features/marketing";
import { DeferredSection } from "@/features/marketing";

const WorkflowOverviewSection = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.WorkflowOverviewSection,
  })),
);
const StepOneSection = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.StepOneSection,
  })),
);
const StepTwoSection = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.StepTwoSection,
  })),
);
const StepThreeSection = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.StepThreeSection,
  })),
);
const CollaborationFlowSection = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.CollaborationFlowSection,
  })),
);
const HowItWorksCTA = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HowItWorksCTA,
  })),
);

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen text-(--text-primary)">
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
