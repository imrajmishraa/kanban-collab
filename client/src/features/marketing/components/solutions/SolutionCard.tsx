import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";

import type { SolutionCard as Card } from "./solutions";

/**
 * One card in a category grid: an icon tile, a title, two lines of copy, and
 * two links. The icon sits in a brand wash rather than a coloured disc, which
 * is the same rule the product uses for a chip.
 */
export default function SolutionCard({ card }: { card: Card }) {
  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-(--hairline) bg-(--bg-surface) p-5 transition-colors duration-200 hover:border-(--hairline-strong) motion-reduce:transition-none">
      <span className="mb-4 grid size-9 place-items-center rounded-lg border border-(--brand-line) bg-(--brand-wash) text-(--brand)">
        <HugeiconsIcon icon={card.icon} size={18} strokeWidth={1.6} />
      </span>

      <h3 className="text-[18px] font-semibold leading-6 tracking-[-0.3px] text-(--text-primary)">
        {card.title}
      </h3>

      <p className="mt-2 flex-1 text-[14.5px] leading-6 text-(--text-secondary)">
        {card.body}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-(--hairline) pt-4">
        {card.links.map((link, index) =>
          link.to.startsWith("http") ? (
            <a
              key={link.label}
              href={link.to}
              className={
                index === 0
                  ? "m-btn-outline h-8 px-3 text-[13px]"
                  : "m-btn-ghost h-8 px-2.5 text-[13px]"
              }
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              to={link.to}
              className={
                index === 0
                  ? "m-btn-outline h-8 px-3 text-[13px]"
                  : "m-btn-ghost h-8 px-2.5 text-[13px]"
              }
            >
              {link.label}
            </Link>
          ),
        )}
      </div>
    </article>
  );
}
