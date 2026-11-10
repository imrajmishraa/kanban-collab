import {
  PageShell,
  SolutionsHero,
  SolutionsOverview,
  SolutionsSplit,
  SolutionsTabs,
  SolutionsWhy,
} from "@/features/marketing";

/**
 * /solutions — the index.
 *
 * A catalogue rather than an essay: the claim, then four doors, then the
 * argument, then the reasons. Each door opens a page of its own, so a link can
 * point at the one category a colleague actually needs.
 */
export default function SolutionsPage() {
  return (
    <PageShell>
      <SolutionsHero
        title="Solutions"
        lead="Four ways into the same product: by team, by workflow, by where it runs, and by the constraint that brought you here."
      />
      <SolutionsTabs />

      <SolutionsOverview />
      <SolutionsSplit />
      <SolutionsWhy />
    </PageShell>
  );
}
