import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellMinusIcon,
  BellRingIcon,
  Cancel01Icon,
  Menu03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import KanbanIcon from "@/assets/KanbanIcon";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { cn } from "@/utils/cn";

import { notificationKeys, notificationsApi } from "@/features/dashboard";
import { useSearchStore } from "@/features/search";

interface SidebarMobileHeaderProps {
  /** Whether the drawer below this bar is open — drives the icon and the label. */
  menuOpen?: boolean;
  onMenuClick: () => void;

  /* The inbox is a sheet rendered by the sidebar, next to this bar — not inside
     it. The bar carries `backdrop-blur`, and a backdrop filter makes the bar the
     containing block for `fixed` children. */
  notificationsOpen?: boolean;
  onToggleNotifications?: () => void;
}

/**
 * The phone bar, taken straight off `DocsNav`: same height (h-16 / sm:h-17),
 * same brand lockup, same hairline and blur, same trigger button with the same
 * `Menu03Icon` / `Cancel01Icon` swap.
 *
 * Docs-only parts are gone (the DOCS chip, "Back to Home", the ⌘K field);
 * search is the icon button the docs bar hides below md, and where the docs bar
 * has GitHub this one has the bell.
 *
 * The bottom hairline is not always there: at rest the bar sits flush on the
 * page, and the line only appears once something has scrolled under it. The
 * border keeps its width either way (`border-transparent`), so nothing moves
 * when it turns on.
 */
export default function SidebarMobileHeader({
  menuOpen = false,
  onMenuClick,
  notificationsOpen = false,
  onToggleNotifications,
}: SidebarMobileHeaderProps) {
  const openSearch = useSearchStore((s) => s.openSearch);

  const [scrolled, setScrolled] = useState(false);

  /* Same key as the desktop navbar, so the badge is one cached request. */
  const { data } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const unreadCount = data?.unreadCount ?? 0;

  /* Capture, because scroll does not bubble: this way one listener hears the
     window and every inner scroller (`main` is the one that scrolls here). */
  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target;

      setScrolled(
        target instanceof HTMLElement
          ? target.scrollTop > 0
          : (window.scrollY ?? 0) > 0,
      );
    };

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });

    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 w-full mx-auto max-w-384 border-x border-b",
        "bg-(--bg-root)/85 backdrop-blur-xl md:hidden",
        scrolled ? "border-(--hairline)" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full items-center gap-3 px-4 sm:h-17 sm:gap-4 sm:px-6">
        {/* ── LEFT: brand ─────────────────────────────────────────── */}
        <Link to="/home" className="flex shrink-0 items-center gap-2.5">
          <span className="flex shrink-0 items-center justify-center">
            <KanbanIcon size={24} variant="upper" theme="auto" />
          </span>
          <span className="text-[17px] font-bold tracking-tight">Kanban</span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <Tooltip label="Search" side="bottom" size="md">
            <button
              type="button"
              onClick={() => openSearch()}
              aria-label="Search"
              className="
                grid size-9 place-items-center rounded-lg text-(--text-secondary)
                transition-colors duration-150
                hover:bg-(--tint-4) hover:text-(--text-primary)
                focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
              "
            >
              <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />
            </button>
          </Tooltip>

          <Tooltip label="Notifications" side="bottom" size="md">
            <button
              type="button"
              onClick={onToggleNotifications}
              aria-expanded={notificationsOpen}
              aria-controls="app-notifications"
              aria-label={
                notificationsOpen
                  ? "Close notifications"
                  : unreadCount > 0
                    ? `Notifications (${unreadCount} unread)`
                    : "Notifications"
              }
              className="
                relative grid size-9 place-items-center rounded-lg text-(--text-secondary)
                transition-colors duration-150
                hover:bg-(--tint-4) hover:text-(--text-primary)
                focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
              "
            >
              {/* Open, the bell becomes a bell-minus: the panel is up, so the
                  button's job is now to put it away. */}
              <HugeiconsIcon
                icon={notificationsOpen ? BellMinusIcon : BellRingIcon}
                size={18}
                strokeWidth={1.8}
              />

              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--accent) px-1 font-mono text-[9px] font-semibold leading-none text-(--solid-text)">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Phone menu: the same trigger the docs bar uses, in the same place,
              so the two bars behave the same way under a thumb. */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="app-mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className={cn(
              "grid size-9 cursor-pointer place-items-center rounded-lg md:hidden",
              "text-(--text-secondary) transition-colors duration-150",
              "hover:bg-(--tint-4) hover:text-(--text-primary)",
              "focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none",
            )}
          >
            <HugeiconsIcon
              icon={menuOpen ? Cancel01Icon : Menu03Icon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
