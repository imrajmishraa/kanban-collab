import { useEffect, useState } from "react";

import { CATEGORIES } from "./solutions";

/**
 * The sticky category bar.
 *
 * The active tab follows the section you are reading rather than only the one
 * you clicked, which is what a catalogue page needs: scroll into Deployment and
 * the bar should say so. An IntersectionObserver on each section does that
 * without a scroll listener firing on every frame.
 *
 * Below `md` the bar scrolls horizontally instead of wrapping, so five labels
 * never turn into three rows of tabs.
 */
export default function CategoryTabs() {
  const [active, setActive] = useState<string>(CATEGORIES[0]?.id ?? "");

  useEffect(() => {
    const sections = CATEGORIES.map((category) =>
      document.getElementById(category.id),
    ).filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      // A band across the middle of the viewport: whichever section is in it
      // owns the bar.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-14 z-30 border-b border-(--hairline) bg-(--bg-surface) md:top-[68px]">
      <div className="mx-auto w-full max-w-384 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((category) => {
            const isActive = active === category.id;

            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "whitespace-nowrap border-b-2 px-3 py-3.5 text-[14px] transition-colors duration-150",
                  isActive
                    ? "border-(--brand) font-semibold text-(--text-primary)"
                    : "border-transparent font-medium text-(--text-secondary) hover:text-(--brand)",
                ].join(" ")}
              >
                {category.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
