import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  KanbanIcon,
  Layout01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { ui } from "@/features/boards/board.helpers";

interface WorkspaceOverviewProps {
  boardCount: number;
  columnCount: number;
  cardCount: number;
  memberCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function WorkspaceOverview({
  boardCount,
  columnCount,
  cardCount,
  memberCount,
}: WorkspaceOverviewProps) {
  const stats = [
    { label: "Boards", value: boardCount, icon: DashboardSquare01Icon },
    { label: "Columns", value: columnCount, icon: Layout01Icon },
    { label: "Cards", value: cardCount, icon: KanbanIcon },
    { label: "Members", value: memberCount, icon: UserGroupIcon },
  ];

  return (
    <section aria-label="Workspace overview" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className={[ui.panel, ui.panelHover, "group p-4"].join(" ")}
          >
            <span aria-hidden="true" className={ui.hairline} />

            <div className="flex items-center justify-between">
              <p className={ui.eyebrow}>{label}</p>
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
