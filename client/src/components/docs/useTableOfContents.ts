import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/**
 * Builds the "On this page" list from the article itself.
 *
 * The headings are already the outline, so a hand-written list next to them goes
 * stale the first time someone renames one. This walks the rendered article,
 * gives every heading an id if it does not have one, and tracks which heading is
 * currently being read.
 *
 * It also does two small things to each heading that the page should not have to
 * remember: a scroll offset so an anchor jump does not land under the sticky
 * header, and a `#` link that appears on hover.
 */

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function useTableOfContents(articleRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    );

    const next: TocItem[] = headings.map((heading) => {
      if (!heading.id) heading.id = slugify(heading.textContent ?? "");

      /* Anchor jumps land the heading flush against the top of the viewport,
         which is behind the sticky header — clicking "Core Concepts" put you at
         "Boards" with the heading you asked for hidden above it. `scroll-margin`
         is the CSS answer: the browser keeps that much space above the target
         when it scrolls to an id. */
      heading.style.scrollMarginTop = "6rem";

      /* A `#` on hover: the heading is already linkable, this only shows the
         reader that it is. Idempotent, because this effect runs again on every
         route change and a heading that already has its anchor must not grow a
         second one. */
      if (!heading.querySelector("[data-heading-anchor]")) {
        const anchor = document.createElement("a");
        anchor.href = `#${heading.id}`;
        anchor.textContent = "#";
        anchor.dataset.headingAnchor = "";
        anchor.setAttribute("aria-label", "Link to this section");
        /* A plain class rather than utilities: these nodes are created at
           runtime, and Tailwind only generates classes it finds in source. */
        anchor.className = "docs-anchor";
        heading.append(anchor);
      }

      return {
        id: heading.id,
        /* `textContent` now includes the "#" we just appended, so the title is
           read from the heading's own text nodes instead. */
        title: Array.from(heading.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? "")
          .join("")
          .trim(),
        level: heading.tagName === "H2" ? 2 : 3,
      };
    });

    setItems(next);
    setActiveId(next[0]?.id ?? "");

    if (next.length === 0) return;

    /* The active section is the last heading whose top has passed a line a fifth
       of the way down the viewport — the heading you have just scrolled into,
       which is what "where am I" means while reading.

       This replaced an IntersectionObserver watching a narrow band. The band had
       two faults: the final headings could never reach it, because the page ran
       out of scroll before they got there, and making them reachable needed a
       large block of empty space below the article. Measuring positions on
       scroll removes both. */
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.2;

      let current = next[0]?.id ?? "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
      }

      setActiveId(current);
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
  }, [articleRef, pathname]);

  return { items, activeId };
}
