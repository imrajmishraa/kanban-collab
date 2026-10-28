import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  CheckListIcon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

interface DashboardOverviewProps {
  workspaceCount: number;
  boardCount: number;
  taskCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The four-up stat strip.
 *
 * Three tiles, not four: the old "Notes" tile was wired to `taskCount` as
 * well, so it repeated the Tasks figure under a different label. The dashboard
 * API has no note count, so the tile is gone until there is one to show.
 */
export default function DashboardOverview({
  workspaceCount,
  boardCount,
  taskCount,
}: DashboardOverviewProps) {
  const stats = [
    { label: "Workspaces", value: workspaceCount, icon: Building02Icon },
    { label: "Boards", value: boardCount, icon: KanbanIcon },
    { label: "Active tasks", value: taskCount, icon: CheckListIcon },
  ];

  return (
    <section aria-label="Workspace overview" className="mt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="
              group relative rounded-xl
              border border-orange-50/15 bg-white/3
              p-4
              transition-colors duration-200
              hover:border-orange-50/25 hover:bg-white/5
            "
          >
            <div className="flex items-center justify-between gap-3">
              {/* Caps are fine here: these are data labels. */}
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                {label}
              </p>

              <HugeiconsIcon
                icon={icon}
                size={14}
                strokeWidth={1.6}
                className="shrink-0 text-neutral-600 transition-colors duration-200 group-hover:text-orange-100"
              />
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight tabular-nums text-neutral-100">
              {pad(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
