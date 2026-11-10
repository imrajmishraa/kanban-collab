import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import { CATEGORIES } from "./solutions";

/**
 * The index grid: one card per category, each a door into its own page.
 *
 * The cards carry the category's first mark rather than a new illustration —
 * the same tile the cards inside that category use, so the shape of the page is
 * recognisable before you read a word of it.
 */
export default function SolutionsOverview() {
  return (
    <section className="border-b border-(--hairline) bg-(--bg-root)">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="max-w-2xl">
          <h2 className="mt-3 text-[26px] font-bold leading-[1.2] tracking-[-0.8px] text-(--text-primary) md:text-[30px]">
            Pick the door that matches your question
          </h2>
          <p className="mt-2 text-[16px] leading-7 text-(--text-secondary)">
            Each category is its own page, so you can send a colleague the exact
            one instead of a link to a long scroll.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/solutions/${category.slug}`}
              className="group flex flex-col rounded-xl border border-(--hairline) bg-(--bg-surface) p-6 transition-colors duration-200 hover:border-(--brand-line) motion-reduce:transition-none"
            >
              <span className="mb-4 grid size-10 place-items-center rounded-lg border border-(--brand-line) bg-(--brand-wash) text-(--brand)">
                <HugeiconsIcon
                  icon={category.icon}
                  size={20}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>

              <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-(--text-primary)">
                {category.title}
              </h3>

              <p className="mt-2 flex-1 text-[14.5px] leading-6 text-(--text-secondary)">
                {category.blurb}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-(--brand)">
                {category.cards.length} solutions
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
