import { useEffect } from "react";

import { cn } from "@/utils/cn";

import NotificationsFeed from "@/features/dashboard/components/notifications/NotificationsFeed";

interface SidebarNotificationsProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The inbox, as the phone panel: a full-width sheet that drops from under the
 * mobile bar, built like `DocsSidebarMobile` — scrim below the bar, `h-0` to
 * full height on `origin-top`, Escape to close.
 *
 * Everything inside is `NotificationsFeed`, the same component the desktop
 * panel renders, so the two cannot drift apart.
 *
 * Mounted by the layout, next to the bar, and not inside it: the bar carries
 * `backdrop-blur`, and a backdrop filter makes the bar the containing block for
 * `fixed` children — the sheet would have been positioned against the bar
 * instead of the viewport.
 */
export default function SidebarNotifications({
  open,
  onClose,
}: SidebarNotificationsProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* The scrim: below the bar, so the bell that opened this stays reachable. */}
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 top-16 z-30 cursor-default bg-black/20 transition-opacity duration-200 sm:top-17 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="app-notifications"
        role="dialog"
        aria-label="Notifications"
        /* Closed, the sheet is zero-height but its rows are still in the tab
           order without this. */
        inert={!open}
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top overflow-hidden border-b border-(--hairline) bg-(--bg-root) transition-all duration-200 ease-out motion-reduce:transition-none sm:top-17 md:hidden",
          open
            ? "h-[calc(100dvh-4rem)] opacity-100 sm:h-[calc(100dvh-4.25rem)]"
            : "pointer-events-none h-0 opacity-0",
        )}
      >
        <div className="flex h-full flex-col">
          <NotificationsFeed />
        </div>
      </div>
    </>
  );
}
