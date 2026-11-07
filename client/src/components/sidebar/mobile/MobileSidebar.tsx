import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import MobileFind from "@/components/sidebar/mobile/MobileFind";
import SidebarFooter from "@/components/sidebar/SidebarFooter";
import MobileNavList from "@/components/sidebar/mobile/MobileNavList";
import MobileWorkspaceSwitch from "@/components/sidebar/mobile/MobileWorkspaceSwitch";
import { cn } from "@/utils/cn";

import type { MobileSidebarProps } from "@/types/mobileSidebar";

/**
 * The phone navigation, built like the notifications sheet: a full-width panel
 * that drops from under the mobile bar, scrim below the bar, `h-0` to full
 * height on `origin-top`.
 *
 * No header of its own — the bar already carries the brand, the bell and the
 * trigger that closes this. So it runs: find, the workspace switch, the nav
 * tree, and a footer pinned to the bottom. Padding and spacing are the docs
 * panel's.
 */
export default function MobileSidebar({
  open,
  onClose,
  user,
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onLogout,
  onOpenNotifications,
}: MobileSidebarProps & {
  /** Opens the inbox sheet, which `DashboardSidebar` owns. */
  onOpenNotifications?: () => void;
}) {
  const { pathname } = useLocation();

  /* A route change closes the panel, or it sits open over the page the reader
     just navigated to. Kept in a ref so a new `onClose` identity every render
     does not re-fire this. */
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    onClose();
  }, [pathname, onClose]);

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
      {/* The scrim: below the bar, so the trigger that opened this stays
          reachable — tapping it again closes. */}
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
        id="app-mobile-nav"
        role="dialog"
        aria-label="Navigation"
        /* Closed, the panel is zero-height but its links are still in the tab
           order without this. */
        inert={!open}
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top overflow-hidden border-b border-(--hairline) bg-(--bg-root) transition-all duration-200 ease-out motion-reduce:transition-none sm:top-17 md:hidden",
          open
            ? "h-[calc(100dvh-4rem)] opacity-100 sm:h-[calc(100dvh-4.25rem)]"
            : "pointer-events-none h-0 opacity-0",
        )}
      >
        {/* Column: everything above the footer scrolls, the footer does not.
            Padding is the docs panel's: px-4 pt-5, px-6 from sm. */}
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-5 sm:px-6">
            {/* Find and the workspace share one row: the field takes the
                space it needs, the switch sits at the right end. */}
            <div className="mb-4 flex shrink-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <MobileFind />
              </div>

              <div className="w-[46%] shrink-0">
                <MobileWorkspaceSwitch
                  workspaces={workspaces}
                  activeWorkspaceId={activeWorkspaceId}
                  onWorkspaceChange={onWorkspaceChange}
                  onNavigate={onClose}
                />
              </div>
            </div>

            <MobileNavList onNavigate={onClose} />
          </div>

          {/* Pinned: the account row never scrolls away. */}
          <div className="shrink-0 border-t border-(--hairline) mx-5">
            {/* Right-aligned menu, and no Sidebar row: the rail does not exist
                at this width, so the option would do nothing. */}
            <SidebarFooter
              collapsed={false}
              user={user}
              onLogout={onLogout}
              showSidebarMode={false}
              menuAlign="right"
              onNotifications={onOpenNotifications}
            />
          </div>
        </div>
      </div>
    </>
  );
}
