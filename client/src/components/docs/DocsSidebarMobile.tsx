import { useEffect } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

import DocsSearch from "./DocsSearch";
import { DocsNavList, ThemeSwitch } from "./DocsSidebarLeft";

interface DocsSidebarMobileProps {
  open: boolean;
  onClose: () => void;
}

export default function DocsSidebarMobile({
  open,
  onClose,
}: DocsSidebarMobileProps) {
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
      {/* The scrim: below the header, so the close button stays reachable. */}
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 top-16 z-30 cursor-default bg-black/20 transition-opacity duration-200 sm:top-17 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="docs-mobile-nav"
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top overflow-hidden border-b border-(--hairline) bg-(--bg-root) transition-all duration-200 ease-out motion-reduce:transition-none sm:top-17 lg:hidden",
          open
            ? "h-[calc(100vh-4rem)] opacity-100 sm:h-[calc(100vh-4.25rem)]"
            : "pointer-events-none h-0 opacity-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain px-4 pt-5 sm:px-6">
          {/* The same field as the header, full width: on a phone there is room
              for it here and nowhere in the bar. */}
          <div className="mb-4 shrink-0">
            <DocsSearch variant="mobile" onNavigate={onClose} />
          </div>

          <DocsNavList onNavigate={onClose} />

          {/* Footer: the theme control and the source link, in the same row.
              `mt-auto` keeps it at the bottom of the panel when the list is
              short, so the panel never ends in dead space. */}
          <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-(--hairline) py-2">
            <div className="min-w-0">
              <ThemeSwitch />
            </div>

            <Link
              to="/home"
              onClick={onClose}
              className="mt-3 shrink-0 rounded-lg px-3 py-2 text-[14px] text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
