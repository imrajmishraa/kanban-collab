import { lazy, Suspense } from "react";

import PageShell from "@/features/marketing/components/shared/PageShell";
import CategoryTabs from "@/features/marketing/components/solutions/CategoryTabs";
import SolutionSection from "@/features/marketing/components/solutions/SolutionSection";
import SolutionsHero from "@/features/marketing/components/solutions/SolutionsHero";
import { CATEGORIES } from "@/features/marketing/components/solutions/solutions";

const HomeClosingCTA = lazy(
  () => import("@/features/marketing/components/home/HomeClosingCTA"),
);

/**
 * Solutions — a catalogue rather than an essay.
 *
 * The nav's Solutions dropdown links to `#teams`, `#workflows`, `#deployment`
 * and `#constraints`, so those four ids are the page's contract: the sticky bar
 * is a convenience on top of them, not a replacement.
 */
export default function SolutionsPage() {
  return (
    <PageShell>
      <SolutionsHero />
      <CategoryTabs />

      {CATEGORIES.map((category) => (
        <SolutionSection key={category.id} category={category} />
      ))}

      <Suspense fallback={null}>
        <HomeClosingCTA />
      </Suspense>
    </PageShell>
  );
}
