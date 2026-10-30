import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import type { SidebarMode } from "@/stores/sidebarState";

interface SidebarModeMenuProps {
  mode: SidebarMode;
  onSelect: (mode: SidebarMode) => void;
}

const MODES: Array<{ mode: SidebarMode; label: string }> = [
  { mode: "open", label: "Expanded" },
  { mode: "collapsed", label: "Collapsed" },
  { mode: "hover", label: "Hover" },
];

/**
 * The child panel behind the Sidebar row: the three ways the rail can behave.
 *
 * Rendered through a portal by its caller, so it floats beside the account
 * menu instead of being clipped by it. The surface is therefore its own, and
 * the width is fixed rather than inherited.
 */
export function SidebarModeMenu({ mode, onSelect }: SidebarModeMenuProps) {
  return (
    <div
      role="group"
      aria-label="Sidebar"
      className="w-30 rounded-xl border border-orange-50/20 bg-[#010101] p-1"
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
              "flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-left",
              "transition-colors duration-150 motion-reduce:transition-none",
              active ? "bg-white/6" : "hover:bg-white/4",
            ].join(" ")}
          >
            <span className="min-w-0 flex-1">
              <span
                className={[
                  "block text-[12px] tracking-tight",
                  active ? "text-neutral-100" : "text-neutral-300",
                ].join(" ")}
              >
                {entry.label}
              </span>
            </span>

            {active && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={13}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-orange-100"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SidebarModeMenu;
