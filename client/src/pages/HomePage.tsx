import { lazy, Suspense } from "react";

import { HeroSection } from "@/features/marketing";

const WhyKanbanSection = lazy(
  () => import("@/features/marketing/components/home/WhyKanbanSection"),
);
const HowItWorksSection = lazy(
  () => import("@/features/marketing/components/home/HowItWorksSection"),
);

const OpenSourceSection = lazy(
  () => import("@/features/marketing/components/home/OpenSourceSection"),
);
const FaqSection = lazy(
  () => import("@/features/marketing/components/home/FaqSection"),
);
const CtaSection = lazy(
  () => import("@/features/marketing/components/home/CtaSection"),
);
const PricingSection = lazy(
  () => import("@/features/marketing/components/home/PricingSection"),
);
const SupportedBySection = lazy(
  () => import("@/features/marketing/components/home/SupportedBySection"),
);
const ContactSection = lazy(
  () => import("@/features/marketing/components/home/ContactSection"),
);

/* NOTE: <homeBackground /> moved into PublicLayout so every public
   route shares the same depth field. Remove any local import of it. */

/* ── Fallback: the same quiet skeleton FeaturesPage uses, so a loading
   section reads as "coming" rather than "broken". ── */
function SectionFallback() {
  return (
    <div
      role="status"
      aria-label="Loading section"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="mx-auto h-7 w-40 rounded-full border border-(--border) bg-(--tint-3)" />
        <div className="mx-auto mt-7 h-9 w-full max-w-xl rounded-lg bg-(--tint-6)" />
        <div className="mx-auto mt-3 h-9 w-2/3 max-w-sm rounded-lg bg-(--tint-4)" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-(--text-primary)">
      <main className="relative z-0">
        {/* HeroSection is eager: it is the first thing on the page, and a
            skeleton there would be worse than no section at all. */}
        <HeroSection />

        <Suspense fallback={<SectionFallback />}>
          <WhyKanbanSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HowItWorksSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <OpenSourceSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FaqSection themeLock="light" />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <ContactSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <PricingSection themeLock="light" />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SupportedBySection themeLock="dark" />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <CtaSection themeLock="light" />
        </Suspense>
      </main>
    </div>
  );
}
