import { lazy, Suspense } from "react";

import { HomeHero } from "@/features/marketing";

const HomeWhyKanban = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeWhyKanban,
  })),
);
const HomeHowItWorks = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeHowItWorks,
  })),
);
const HomeOpenSource = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeOpenSource,
  })),
);
const HomeFAQ = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeFAQ,
  })),
);
const HomeClosingCTA = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeClosingCTA,
  })),
);
const HomePricing = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomePricing,
  })),
);
const HomeSupportedBy = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeSupportedBy,
  })),
);

const HomeContact = lazy(() =>
  import("@/features/marketing").then((module) => ({
    default: module.HomeContact,
  })),
);

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
    <div className="light-theme marketing relative min-h-screen bg-(--bg-root) text-(--text-primary)">
      <main className="relative z-0">
        {/* HomeHero is eager: it is the first thing on the page, and a
            skeleton there would be worse than no section at all. */}
        <HomeHero />

        <Suspense fallback={<SectionFallback />}>
          <HomeWhyKanban />
        </Suspense>

        <Suspense fallback={<SectionFallback />}></Suspense>
        <HomeHowItWorks />
        <Suspense fallback={<SectionFallback />}>
          <HomeOpenSource />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HomeFAQ themeLock="light" />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HomeContact />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HomePricing themeLock="light" />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HomeSupportedBy />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <HomeClosingCTA themeLock="light" />
        </Suspense>
      </main>
    </div>
  );
}
