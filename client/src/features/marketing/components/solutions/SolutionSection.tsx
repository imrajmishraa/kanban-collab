import SolutionCard from "./SolutionCard";
import type { SolutionCategory } from "./solutions";

/**
 * One category: a head, then the grid. `scroll-mt` clears the sticky nav and
 * the sticky tab bar, so an anchor lands on the heading rather than under them.
 */
export default function SolutionSection({
  category,
}: {
  category: SolutionCategory;
}) {
  return (
    <section
      id={category.id}
      className="scroll-mt-32 border-b border-(--hairline) bg-(--bg-root) last:border-b-0"
    >
      <div className="mx-auto w-full max-w-384 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="max-w-2xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-muted)">
            {category.label}
          </span>
          <h2 className="mt-3 text-[26px] font-bold leading-[1.2] tracking-[-0.8px] text-(--text-primary) md:text-[30px]">
            {category.title}
          </h2>
          <p className="mt-2 text-[16px] leading-7 text-(--text-secondary)">
            {category.blurb}
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.cards.map((card) => (
            <SolutionCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
