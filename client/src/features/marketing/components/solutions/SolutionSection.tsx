import SolutionCard from "./SolutionCard";
import type { SolutionCategory } from "./solutions";

/**
 * One category: a head, the long line, then the grid.
 *
 * The hero above the tabs already said the short version, so this section opens
 * with a different sentence — the paragraph you would write if someone asked
 * "what does this category actually mean?" — and gives it a wider measure than
 * the card column, because it is the only prose on the page.
 */
export default function SolutionSection({
  category,
}: {
  category: SolutionCategory;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header>
        <h2 className="text-[28px] font-bold leading-[1.15] tracking-[-0.9px] text-(--text-primary) sm:text-[32px] md:text-[36px]">
          {category.title}
        </h2>

        <p className="mt-4 max-w-3xl text-[16px] leading-[1.75] text-(--text-secondary) sm:text-[17px]">
          {category.description}
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.cards.map((card) => (
          <SolutionCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
