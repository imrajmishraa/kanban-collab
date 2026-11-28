import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/cn";
import {
  CollapseIcon,
  ExpandIcon,
  LayoutAlignRightIcon,
} from "@hugeicons/core-free-icons";

import { NotificationsButton } from "@/features/dashboard";
import { Tooltip } from "@/components/Tooltips/ToolTip";

export interface PanelHeaderProps {
  level: "closed" | "normal" | "remaining" | "full";
  isMac: boolean;
  notificationsOpen: boolean;
  unreadCount: number;
  onToggleLevel: () => void;
  onToggleNotifications: () => void;
  onClose: () => void;
}

/**
 * The column's bar. Split out of `RightPanel` for the line budget, and because it
 * is the one part of the column that is chrome rather than layout.
 */
export default function PanelHeader({
  level,
  isMac,
  notificationsOpen,
  unreadCount,
  onToggleLevel,
  onToggleNotifications,
  onClose,
}: PanelHeaderProps) {
  /* The same surface the bar wears: a gradient that is solid at the bottom and
     gone by the top, blurred over whatever passes beneath it. No border — the
     fade is the edge. */
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 bg-gradient-to-t from-(--bg-root)/90 via-(--bg-root)/55 to-transparent px-3 backdrop-blur-md">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)"></h2>

      <div className="flex shrink-0 items-center gap-1">
        {/* The bell lives where the notifications are: in the column, while the
                  column is open. The bar drops its own copy at that point, so there is
                  never a second one pointing at the same panel. */}
        <NotificationsButton
          isOpen={notificationsOpen}
          unreadCount={unreadCount}
          onClick={onToggleNotifications}
        />

        {/* Full width: everything the app rail leaves, never the rail itself.
                  Two shapes, one control: a bare square while the panel is a column,
                  icon + label once it owns the window. */}
        <Tooltip
          label={level === "remaining" ? "Show page" : "Full width"}
          highlight={isMac ? "⌘⇧J" : "Ctrl⇧J"}
          side="bottom"
          shape="solid"
          size="md"
        >
          <button
            type="button"
            onClick={onToggleLevel}
            aria-label={
              level === "remaining"
                ? "Show the page"
                : "Take the remaining width"
            }
            aria-pressed={level === "remaining"}
            aria-keyshortcuts="Meta+Shift+J Control+Shift+J"
            className={cn(
              /* `h-8` + `w-8`, never `size-8`: `size-*` sets both, and it would
                       fight the `px-*` that the labelled state needs. */
              "flex h-8 items-center justify-center rounded-lg",
              "text-(--text-primary) hover:bg-(--bg-hover)",
              "focus-visible:outline-2 focus-visible:outline-(--brand)",
              level === "remaining"
                ? "gap-1.25 px-2.5 mr-1 border border-(--hairline) hover:border-(--hairline-strong)"
                : "w-8",
            )}
          >
            <HugeiconsIcon
              icon={level === "remaining" ? CollapseIcon : ExpandIcon}
              size={level === "remaining" ? 16 : 18}
              strokeWidth={1.6}
            />

            {level === "remaining" && (
              <span className="whitespace-nowrap text-[12px] leading-none ">
                Show page
              </span>
            )}
          </button>
        </Tooltip>

        {/* The same control that opens the panel, where the close button used to
                  be: the icon is never a mystery. */}

        <Tooltip
          label="Hide panel"
          highlight={isMac ? "⌘J" : "Ctrl J"}
          side="bottom"
          shape="solid"
          size="md"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide panel"
            aria-controls="right-panel"
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg bg-(--bg-hover)",
              "text-(--text-primary) transition-colors hover:bg-(--bg-active)",
              "focus-visible:outline-2 focus-visible:outline-(--brand)",
            )}
          >
            <HugeiconsIcon icon={LayoutAlignRightIcon} size={18} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
