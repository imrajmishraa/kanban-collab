import { Link, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { DOCS_PAGES } from "./docsConfig";

/**
 * Previous / next, at the foot of a page.
 *
 * Two columns at every width, not just from `sm`. `sm:grid-cols-2` means "one
 * column below 640px", which on a phone stacked the two cards — the opposite of
 * what this is for. Two short labels fit side by side even at 320px; stacking
 * them turns a footer into two more paragraphs.
 *
 * `col-start-2` on the next card is what keeps it on the right when there is no
 * previous page. Without it a lone next card lands in the first column, on the
 * wrong side of the rule it belongs to.
 *
 * The order is the sidebar's order, read from `DOCS_PAGES`, so the two can never
 * disagree about what follows what. It lives outside the `<article>`, so "Copy
 * page" does not pick it up.
 */
export default function DocsPagination() {
  const { pathname } = useLocation();

  const index = DOCS_PAGES.findIndex((page) => page.href === pathname);
  if (index === -1) return null;

  const previous = index > 0 ? DOCS_PAGES[index - 1] : undefined;
  const next =
    index < DOCS_PAGES.length - 1 ? DOCS_PAGES[index + 1] : undefined;

  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Documentation pagination"
      className="mx-auto mt-30 grid grid-cols-2 gap-3 border-t border-(--hairline) py-20"
    >
      {previous ? (
        <Link
          to={previous.href}
          rel="prev"
          className="
            group flex flex-col rounded-xl border border-(--hairline) p-4
            transition-colors duration-150
            hover:border-(--hairline) hover:bg-(--tint-4)
          "
        >
          <span className="flex items-center gap-1.5 text-[13px] text-(--text-muted)">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="mt-1 text-[15px] font-medium text-(--text-primary) transition-colors duration-150 group-hover:text-blue-500">
            {previous.title}
          </span>
        </Link>
      ) : null}

      {next ? (
        <Link
          to={next.href}
          rel="next"
          className="
            group col-start-2 flex flex-col items-end rounded-xl border
            border-(--hairline) p-4 text-right transition-colors duration-150
            hover:border-(--hairline) hover:bg-(--tint-4)
          "
        >
          <span className="flex items-center gap-1.5 text-[13px] text-(--text-muted)">
            Next
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </span>
          <span className="mt-1 text-[15px] font-medium text-(--text-primary) transition-colors duration-150 group-hover:text-blue-500">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
