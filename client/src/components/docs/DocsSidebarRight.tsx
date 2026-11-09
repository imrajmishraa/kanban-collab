import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";

import type { TocItem } from "./useTableOfContents.ts";

/**
 * The right column: what is on this page, and two ways out of it.
 *
 * The list is handed in rather than computed here — it comes from the article
 * the layout is rendering, so the column has nothing to query and nothing to
 * keep in step.
 *
 * Both levels are listed, not just the h2s. A long section is usually read one
 * sub-heading at a time, and a contents list that stops at the top level makes
 * you scroll to find out where inside "Key Features" you are. The h3s are
 * indented and lighter so the hierarchy reads at a glance rather than turning
 * the column into a second sidebar.
 *
 * Colour: the h2s sit in the page's ink, the h3s one step back, and the section
 * being read is the only blue — the same active treatment the sidebar uses, so
 * the two columns agree on what "current" looks like.
 *
 * Layout: the column is as tall as its content, and only the list gets a
 * maximum height. Giving the column a fixed height and letting the list fill it
 * pushed the feedback row to the bottom of the viewport, far below a short
 * contents list — the footer belongs right under the list, where it was.
 */

/** Past this much of the page, "Scroll to top" is worth offering. */
const SCROLL_TOP_THRESHOLD = 0.3;

interface DocsSidebarRightProps {
  items: TocItem[];
  activeId: string;
}

export default function DocsSidebarRight({
  items,
  activeId,
}: DocsSidebarRightProps) {
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* The list has its own scroll offset, kept in step with the section being
       read. Scrolling the page back to the top left the column still parked at
       whatever section you had reached, so the first entries never came back
       into view. Take it home too. */
    navRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Keep the active entry visible inside the list without touching the page.
     `scrollIntoView` was the obvious call and the wrong one: it scrolls every
     scrollable ancestor it can reach, so reading a section would yank the
     document under the reader. This moves the list's own `scrollTop` by the
     smallest amount that brings the entry into view, and nothing else. */
  useEffect(() => {
    const nav = navRef.current;
    const entry = activeRef.current;
    if (!nav || !entry) return;

    /* Measured with rects, not `offsetTop`: the list is not positioned, so
       `offsetTop` is taken from the nearest positioned ancestor — the sticky
       column — and carried an extra label's height. That scrolled the list a
       row too far and hid the first entries. Rects are relative to the
       viewport, so the subtraction is honest wherever the column sits. */
    const navRect = nav.getBoundingClientRect();
    const entryRect = entry.getBoundingClientRect();

    const top = entryRect.top - navRect.top + nav.scrollTop;
    const bottom = top + entryRect.height;
    const margin = 8;

    if (top - margin < nav.scrollTop) {
      nav.scrollTop = Math.max(top - margin, 0);
    } else if (bottom + margin > nav.scrollTop + nav.clientHeight) {
      nav.scrollTop = bottom + margin - nav.clientHeight;
    }
  }, [activeId]);

  /* "Scroll to top" is only useful once you are somewhere worth coming back
     from, so it stays hidden over the first third of the page. The fraction is
     of the scrollable range, not of the document height — on a short page the
     document is barely taller than the viewport, and measuring against the
     document would make the threshold unreachable. */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTop(
        range > 0 && window.scrollY / range > SCROLL_TOP_THRESHOLD,
      );
    };

    const onScroll = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside className="hidden w-60 shrink-0 xl:block">
      {/* The offset clears the sticky navbar (h-16, sm:h-17) with a little air.
          Smaller than that and the column's top — the "On This Page" label —
          slides in behind the bar and is unreadable. */}
      <div className="sticky top-18 py-8 sm:top-19">
        <p className="text-[13px] font-bold text-(--text-primary)">
          On This Page
        </p>

        {/* Only the list is capped. `max-h` rather than a fixed height on the
            column: a short contents list should end where it ends, with the
            feedback row right under it, not pin it to the foot of the screen. */}
        <nav
          ref={navRef}
          aria-label="On this page"
          className="mt-3 flex max-h-[calc(100vh-17rem)] flex-col overflow-y-auto overscroll-contain pr-1"
        >
          {items.length === 0 ? (
            <p className="text-[14px] text-(--text-muted)">
              This page has no sections yet.
            </p>
          ) : (
            items.map((item, index) => {
              const isNested = item.level === 3;
              const isActive = item.id === activeId;

              return (
                <a
                  key={item.id}
                  ref={isActive ? activeRef : undefined}
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "leading-snug transition-colors duration-150",
                    /* An h3 belongs to the h2 above it, so it gets the indent
                       and the smaller step. The top-level entries keep a little
                       air above them so the groups separate. */
                    isNested
                      ? "py-0.5 pl-4 text-[12px]"
                      : "py-0.75 text-[13px] font-semibold",
                    index === 0 ? "" : isNested ? "" : "mt-px",
                    isActive
                      ? "font-semibold text-blue-500"
                      : isNested
                        ? "text-(--text-muted) hover:text-(--text-primary)"
                        : "text-(--text-secondary) hover:text-(--text-primary)",
                  )}
                >
                  {item.title}
                </a>
              );
            })
          )}
        </nav>

        <div className="mt-6 border-t border-(--hairline) pt-4">
          {/* Two links on one line, wrapping only if the column is narrow. A
              two-column grid split the width evenly, which put a wide gap
              between a short label and a long one. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {/* A mail link is an `<a href="mailto:">`, not a route. `to="/mailto:…"`
                made React Router treat it as an in-app path and land on the 404
                page. */}
            <a
              href="mailto:raj212558@gmail.com"
              className="rounded-lg py-1 text-[12px] text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
            >
              Question?
            </a>
            <Link
              to="/feedback"
              className="rounded-lg py-1 text-[12px] text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
            >
              Give us feedback
            </Link>
          </div>

          {/* Collapsed with `grid-rows`, not conditionally rendered: the row
              animates open instead of appearing. The inner `overflow-hidden` is
              what makes `0fr` actually clip — without it the button keeps its
              height and the animation does nothing. */}
          <div
            className={cn(
              "grid transition-all duration-200 ease-out motion-reduce:transition-none",
              showScrollTop
                ? "mt-1 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
            aria-hidden={!showScrollTop}
          >
            <div className="overflow-hidden">
              <button
                type="button"
                onClick={scrollToTop}
                tabIndex={showScrollTop ? 0 : -1}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-[13px] text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
              >
                Scroll to top
                <HugeiconsIcon icon={ArrowUp01Icon} size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
