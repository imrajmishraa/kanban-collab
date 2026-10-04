import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BellIcon,
  DashboardSquare02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { useSearchStore } from "@/stores/searchStore";
import { Tooltip } from "#components/Tooltips/ToolTip";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function NavbarSearchIcon() {
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <div className="group/tt relative">
      <Tooltip
        label={isMac ? "Search  ⌘K" : "Search  Ctrl+K"}
        side="bottom"
        shape="solid"
        size="sm"
      >
        <button
          type="button"
          onClick={openSearch}
          aria-label="Notifications"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-(--text-secondary) transition-colors duration-200 hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.6} />
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

export function NotificationsButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Notifications" side="bottom" shape="solid" size="sm">
      <button
        type="button"
        onClick={onClick}
        aria-label="Notifications"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-(--text-secondary) transition-colors duration-200 hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)"
      >
        <HugeiconsIcon icon={BellIcon} size={16} strokeWidth={1.6} />
      </button>
    </Tooltip>
  );
}
