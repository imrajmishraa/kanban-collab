import { NavLink } from "react-router-dom";

import { SOLUTIONS_TABS } from "./solutions";

/**
 * The sticky tab bar.
 *
 * Every tab is a route, not an anchor: each category is a page of its own, so
 * the bar says where you are and gets you to the others in one click. The
 * active tab is a real `NavLink` state rather than a scroll observer, because
 * with one section per page there is nothing to observe.
 *
 * Below `md` the bar scrolls sideways instead of wrapping, so five labels never
 * become three rows of tabs.
 */
export default function SolutionsTabs() {
  return (
    <nav
      aria-label="Solutions"
      className="sticky top-14 z-30 border-y border-(--hairline) bg-(--bg-surface) md:top-17"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          <NavLink
            to="/solutions"
            end
            className={({ isActive }) =>
              [
                "whitespace-nowrap border-b-2 px-3 py-3.5 text-[14px] transition-colors duration-150",
                isActive
                  ? "border-(--brand) font-semibold text-(--text-primary)"
                  : "border-transparent font-medium text-(--text-secondary) hover:text-(--brand)",
              ].join(" ")
            }
          >
            All solutions
          </NavLink>

          {SOLUTIONS_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap border-b-2 px-3 py-3.5 text-[14px] transition-colors duration-150",
                  isActive
                    ? "border-(--brand) font-semibold text-(--text-primary)"
                    : "border-transparent font-medium text-(--text-secondary) hover:text-(--brand)",
                ].join(" ")
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
