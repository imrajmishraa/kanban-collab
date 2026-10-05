import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckListIcon,
  Building02Icon,
  KanbanIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons";

interface DashboardOverviewProps {
  workspaceCount: number;
  boardCount: number;
  taskCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function DashboardOverview({
  workspaceCount,
  boardCount,
  taskCount,
}: DashboardOverviewProps) {
  const stats = [
    { label: "Workspaces", value: workspaceCount, icon: Building02Icon },
    { label: "Boards", value: boardCount, icon: KanbanIcon },
    { label: "Tasks", value: taskCount, icon: CheckListIcon },
    { label: "Notes", value: taskCount, icon: Note01Icon },
  ];

  return (
    <section aria-label="Workspace overview" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="
              group relative overflow-hidden rounded-xl
              border border-white/8 bg-white/4
              p-4
              transition-colors duration-200
              hover:border-white/14 hover:bg-white/6
            "
          >
            {/* Top hairline — same accent as every other panel */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-x-0 top-0 h-px
                bg-linear-to-r from-transparent via-white/15 to-transparent
              "
            />

            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                {label}
              </p>

              <HugeiconsIcon
                icon={icon}
                size={14}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-muted) transition-colors duration-200 group-hover:text-(--brand)"
              />
            </div>

            <p className="mt-3 font-mono text-[26px] font-semibold leading-none tracking-tight tabular-nums text-(--text-primary)">
              {pad(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
