import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BellRingIcon,
  DashboardSquare02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { useSearchStore } from "@/features/search";
import { Tooltip } from "@/components/Tooltips/ToolTip";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function NavbarSearchIcon() {
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <div className="group/tt relative">
      <Tooltip
        label="Search"
        highlight={isMac ? "⌘K" : "Ctrl K"}
        side="bottom"
        shape="solid"
        size="md"
      >
        <button
          type="button"
          onClick={() => openSearch()}
          aria-label="Search"
          className={[
            "grid size-8 place-items-center rounded-lg",
            "hover:bg-(--bg-hover) text-(--text-primary)",
            "focus-visible:outline-2 focus-visible:outline-(--brand)",
          ].join(" ")}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />
        </button>
      </Tooltip>
    </div>
  );
}

export function Chevron() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center px-0.5">
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={14}
        strokeWidth={1.8}
        className="text-(--text-muted)"
      />
    </span>
  );
}

export function DashIcon() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center px-0.5">
      <HugeiconsIcon
        icon={DashboardSquare02Icon}
        size={16}
        strokeWidth={1.8}
        className="text-(--text-muted)"
      />
    </span>
  );
}

/**
 * The bell. Open, it turns into a bell-minus: the panel is up, and the button's
 * job is now to put it away again.
 */
export function NotificationsButton({
  isOpen = false,
  onClick,
  unreadCount = 0,
}: {
  /** Whether the panel this button opens is on screen. */
  isOpen?: boolean;
  onClick: () => void;
  unreadCount?: number;
}) {
  return (
    <Tooltip
      label="Notifications"
      highlight={"N"}
      side="bottom"
      shape="solid"
      size="md"
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? "Close notifications"
            : unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
        }
        className={[
          "grid size-8 place-items-center rounded-lg",
          "hover:bg-(--bg-hover) text-(--text-primary)",
          "focus-visible:outline-2 focus-visible:outline-(--brand)",
          isOpen ? "bg-(--tint-6)" : null,
        ].join(" ")}
      >
        {/* Open, the bell becomes a bell-minus: the panel is up, so the
            button's job is now to put it away. */}
        <HugeiconsIcon icon={BellRingIcon} size={18} strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--accent) px-1 font-mono text-[9px] font-semibold leading-none text-(--solid-text)">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
