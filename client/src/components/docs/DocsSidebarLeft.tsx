import { HugeiconsIcon } from "@hugeicons/react";
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "@hugeicons/core-free-icons";

import { DocsNavList } from "./DocsNavList";
import { ThemeSwitch } from "./ThemeSwitch";

/**
 * The left column: the documentation tree, and the two controls under it.
 *
 * `DocsNavList` is exported because the phone drawer renders the same tree. One
 * component, two placements — the alternative was two copies of the same
 * active-state logic, which is exactly the kind of thing that drifts.
 *
 * The column can be collapsed. When it is, the tree goes and the two controls
 * stay, floating in the corner: the theme switch and the button that brings the
 * column back. A collapsed sidebar with no way to expand it is a dead end, and
 * losing the theme switch with it would be a second one.
 *
 * Colour: every row rests in `--text-muted`. The active page is the only thing
 * that carries the blue — the tint behind it and the ink on top — so the eye
 * finds the current page without the rest of the tree competing for attention.
 */

/**
 * The theme control, as a menu.
 *
 * It used to cycle: light, then dark, then system. Cycling hides two of the
 * three choices behind a guess — you cannot ask for "system" without going
 * through the other two first — so the row now opens a small popover with all
 * three and a tick on the current one, the way the reference does it.
 */
interface DocsSidebarLeftProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DocsSidebarLeft({
  collapsed,
  onToggle,
}: DocsSidebarLeftProps) {
  if (collapsed) {
    return (
      <aside className="hidden shrink-0 lg:block lg:w-14">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-end gap-1 py-8 sm:top-17 sm:h-[calc(100vh-4.25rem)]">
          <div className="mb-2 w-6 border-t border-(--hairline)" />

          <ThemeSwitch compact />

          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand the sidebar"
            aria-controls="docs-sidebar"
            aria-expanded={false}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-8) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={PanelLeftCloseIcon}
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden shrink-0 lg:block lg:w-64">
      {/* `h-` rather than `max-h`: with a max, a short nav lets the column
          shrink and the footer rides up with it, so the row sits under the last
          link instead of at the bottom of the viewport.

          The height is the viewport minus the header, and the header is two
          different heights — 64px below `sm`, 68px from it — so the subtraction
          changes with the same breakpoint. One fixed 4rem left the footer 4px
          past the bottom edge on every desktop width. */}
      <div
        id="docs-sidebar"
        className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col py-4 sm:top-17 sm:h-[calc(100vh-4.25rem)]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DocsNavList />
        </div>

        {/* Pinned to the bottom of the column by the flex layout above: the nav
            is the only child that grows and scrolls, so this row cannot move.
            It must stay in the flow — `fixed` took it out of the column and the
            `hidden` that came with it made it disappear entirely. */}
        <div className="mt-6 flex shrink-0 items-center gap-1 border-t border-(--hairline) pt-4">
          <div className="min-w-0 flex-1">
            <ThemeSwitch />
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse the sidebar"
            aria-controls="docs-sidebar"
            aria-expanded
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-8) hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={PanelLeftOpenIcon}
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
