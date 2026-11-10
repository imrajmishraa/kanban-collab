import {
  CATEGORIES,
  PageShell,
  SolutionSection,
  SolutionsHero,
  SolutionsTabs,
  SolutionsWhy,
  TourCta,
} from "@/features/marketing";

/**
 * /solutions/<category> — one category, on its own page.
 *
 * The component takes the slug rather than reading the URL, so the route table
 * stays explicit: five paths, each naming the category it renders. An unknown
 * slug falls back to the first category rather than rendering an empty page.
 */
export default function SolutionCategoryPage({ slug }: { slug: string }) {
  const category =
    CATEGORIES.find((entry) => entry.slug === slug) ?? CATEGORIES[0];

  return (
    <PageShell>
      <SolutionsHero title={category.title} lead={category.blurb} />
      <SolutionsTabs />

      <SolutionSection category={category} />
      <SolutionsWhy />
      <TourCta />
    </PageShell>
  );
}
