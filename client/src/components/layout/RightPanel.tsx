import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { NotificationsFeed } from "@/features/dashboard";
import { useRightPanel } from "@/stores/rightPanel";

/**
 * The optional right column.
 *
 * A third host for `NotificationsFeed` — the desktop sheet under the navbar and
 * the phone sheet already render it, and this one differs only in where it
 * sits and that it does not close when you open a notification. Keeping one
 * feed means the three cannot drift apart.
 *
 * Layout notes that are not obvious from the classes:
 *
 * - `top-14` starts it under the navbar (`fixed h-14`), rather than fighting
 *   the navbar's `z-50` for the same pixels.
 * - `hidden lg:flex` is the whole tablet story: between 768 and 1023 the column
 *   is not shown at all, so it can never squeeze the board — the failure mode
 *   `docs/change-rules.md` calls "no middle step".
 * - `h-[calc(100dvh-3.5rem)]` is the viewport minus that navbar, in `dvh` so
 *   iOS's collapsing chrome does not push the last row off the bottom.
 * - The close button is 44px (`size-11`) because it is the only control here
 *   and it sits under a thumb on a tablet.
 */
export default function RightPanel() {
  const mode = useRightPanel((state) => state.mode);
  const setMode = useRightPanel((state) => state.setMode);

  if (mode === "off") return null;

  return (
    <aside
      aria-label="Notifications"
      className={[
        "fixed right-0 top-14 z-30 hidden w-90 flex-col lg:flex",
        "h-[calc(100dvh-3.5rem)]",
        "border-l border-(--hairline) bg-(--bg-surface)",
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-(--hairline) px-4 py-2">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
          Notifications
        </h2>

        <button
          type="button"
          onClick={() => setMode("off")}
          aria-label="Hide the notifications panel"
          className={[
            "grid size-11 place-items-center rounded-lg text-(--text-muted)",
            "transition-colors hover:bg-(--bg-hover) hover:text-(--text-primary)",
            "focus-visible:outline-2 focus-visible:outline-(--brand)",
          ].join(" ")}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotificationsFeed />
      </div>
    </aside>
  );
}
