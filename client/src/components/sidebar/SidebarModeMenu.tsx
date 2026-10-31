import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cursor02Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "@hugeicons/core-free-icons";

import type { SidebarMode } from "@/features/dashboard/stores/sidebarState";

interface SidebarModeMenuProps {
  mode: SidebarMode;
  onSelect: (mode: SidebarMode) => void;
  icon?: typeof Cursor02Icon;
}

const MODES: Array<{
  mode: SidebarMode;
  label: string;
  icon: typeof Cursor02Icon;
}> = [
  { mode: "open", label: "Expanded", icon: PanelLeftCloseIcon },
  { mode: "collapsed", label: "Collapsed", icon: PanelLeftOpenIcon },
  { mode: "hover", label: "Hover", icon: Cursor02Icon },
];

export function SidebarModeMenu({ mode, onSelect }: SidebarModeMenuProps) {
  return (
    <div
      role="group"
      aria-label="Sidebar"
      className="w-30 rounded-xl border border-(--hairline-strong) bg-(--bg-root) p-1"
    >
      {MODES.map((entry) => {
        const active = entry.mode === mode;

        return (
          <button
            key={entry.mode}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            onClick={() => onSelect(entry.mode)}
            className={[
              "group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left",
              "transition-colors duration-150 motion-reduce:transition-none",
              active ? "bg-(--tint-6)" : "hover:bg-(--tint-4)",
            ].join(" ")}
          >
            <span
              className={[
                "min-w-0 flex-1 truncate text-[12px] tracking-tight",
                "transition-colors duration-150 motion-reduce:transition-none",
                active
                  ? "text-(--text-primary)"
                  : "text-(--text-soft) group-hover:text-(--text-primary)",
              ].join(" ")}
            >
              {entry.label}
            </span>

            <HugeiconsIcon
              icon={entry.icon}
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
              className={[
                "shrink-0 transition-colors duration-150 motion-reduce:transition-none",
                active
                  ? "text-(--accent)"
                  : "text-(--text-muted) group-hover:text-(--text-primary)",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}

export default SidebarModeMenu;
