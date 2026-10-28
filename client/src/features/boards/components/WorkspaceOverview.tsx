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
  /**
   * True while only some boards have been loaded. Columns and cards are then
   * counted from what is loaded, so they get a "+" instead of pretending to
   * be totals.
   */
  isPartial?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function WorkspaceOverview({
  boardCount,
  columnCount,
  cardCount,
  memberCount,
  isPartial = false,
}: WorkspaceOverviewProps) {
  const stats = [
    // The board count is a real total from the API's pagination.
    {
      label: "Boards",
      value: boardCount,
      icon: DashboardSquare01Icon,
      partial: false,
    },
    {
      label: "Columns",
      value: columnCount,
      icon: Layout01Icon,
      partial: isPartial,
    },
    { label: "Cards", value: cardCount, icon: KanbanIcon, partial: isPartial },
    {
      label: "Members",
      value: memberCount,
      icon: UserGroupIcon,
      partial: false,
    },
  ];

  return (
    <section aria-label="Workspace overview" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon, partial }) => (
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
                className="shrink-0 text-neutral-600 transition-colors duration-200 group-hover:text-orange-100"
              />
            </div>

            <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight tabular-nums text-neutral-100">
              {pad(value)}
              {partial && <span className="text-neutral-500">+</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
