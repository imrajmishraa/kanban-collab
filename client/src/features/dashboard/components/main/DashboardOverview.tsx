import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  CheckListIcon,
  KanbanIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

interface DashboardOverviewProps {
  workspaceCount: number;
  boardCount: number;
  taskCount: number;
  /** Distinct people, not a sum of workspace membership. */
  memberCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The stat strip.
 *
 * Four tiles: workspaces, boards, active tasks and people. The member figure is
 * a distinct count across every workspace, so somebody who belongs to three
 * workspaces is counted once.
 *
 * Two columns from `xs`, four from `lg`: on a phone the numbers stay readable
 * instead of shrinking to four unreadable columns.
 */
export default function DashboardOverview({
  workspaceCount,
  boardCount,
  taskCount,
  memberCount,
}: DashboardOverviewProps) {
  const stats = [
    { label: "Workspaces", value: workspaceCount, icon: Building02Icon },
    { label: "Boards", value: boardCount, icon: KanbanIcon },
    { label: "Active tasks", value: taskCount, icon: CheckListIcon },
    { label: "Members", value: memberCount, icon: UserGroupIcon },
  ];

  return (
    <section aria-label="Workspace overview" className="mt-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="
              group relative min-w-0 rounded-xl
              border border-(--hairline) bg-(--tint-3)
              p-3.5 sm:p-4
              transition-colors duration-200
              hover:border-(--hairline-strong) hover:bg-(--bg-hover)
            "
          >
            <div className="flex items-center justify-between gap-2">
              {/* Caps are fine here: these are data labels. */}
              <p className="truncate font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-(--text-muted) sm:text-[10px] sm:tracking-[0.18em]">
                {label}
              </p>

              <HugeiconsIcon
                icon={icon}
                size={14}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-subtle) transition-colors duration-200 group-hover:text-(--accent)"
              />
            </div>

            <p className="mt-2.5 text-[22px] font-semibold leading-none tracking-tight tabular-nums text-(--text-primary) sm:mt-3 sm:text-[26px]">
              {pad(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
