import { lazy, Suspense } from "react";

import FeaturesHero from "@components/layout/marketing/features/FeaturesHero";


const CoreFeaturesSection = lazy(
  () => import("@components/layout/marketing/features/CoreFeaturesSection"),
);
const CollaborationSection = lazy(
  () => import("@components/layout/marketing/features/CollaborationSection"),
);
const ProductivitySection = lazy(
  () => import("@components/layout/marketing/features/ProductivitySection"),
);
const SecuritySection = lazy(
  () => import("@components/layout/marketing/features/SecuritySection"),
);
const TechnologySection = lazy(
  () => import("@components/layout/marketing/features/TechnologySection"),
);
const FeaturesCTA = lazy(
  () => import("@components/layout/marketing/features/FeaturesCTA"),
);

/* ── Fallback: a quiet skeleton in the page's own visual language,
   so a loading section reads as "coming" rather than "broken". ── */
function SectionFallback() {
  return (
    <div
      role="status"
      aria-label="Loading section"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="animate-pulse motion-reduce:animate-none">
        {/* eyebrow pill */}
        <div className="mx-auto h-7 w-40 rounded-full border border-white/8 bg-white/3" />

        {/* heading */}
        <div className="mx-auto mt-7 h-9 w-full max-w-xl rounded-lg bg-white/6" />
        <div className="mx-auto mt-3 h-9 w-2/3 max-w-sm rounded-lg bg-white/4" />

        {/* body copy */}
        <div className="mx-auto mt-6 h-3 w-full max-w-md rounded-full bg-white/3" />

        {/* card row */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-white/6 bg-white/3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen text-neutral-100">
      <main className="relative z-0">
        {/* Eager — above the fold */}
        <FeaturesHero />

        {/* Lazy — each section streams in behind its own fallback */}
        <Suspense fallback={<SectionFallback />}>
          <CoreFeaturesSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <CollaborationSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <ProductivitySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SecuritySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <TechnologySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FeaturesCTA />
        </Suspense>
      </main>
    </div>
  );
}
