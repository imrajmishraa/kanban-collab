import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckListIcon,
  KanbanIcon,
  Layout01Icon,
} from "@hugeicons/core-free-icons";

import { ui } from "@/features/boards/board.helpers";

interface BoardOverviewProps {
  columnCount: number;
  cardCount: number;
  doneCount: number;
  overdueCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function BoardOverview({
  columnCount,
  cardCount,
  doneCount,
  overdueCount,
}: BoardOverviewProps) {
  const stats = [
    { label: "Columns", value: columnCount, icon: Layout01Icon, danger: false },
    { label: "Cards", value: cardCount, icon: KanbanIcon, danger: false },
    { label: "Done", value: doneCount, icon: CheckListIcon, danger: false },
    { label: "Overdue", value: overdueCount, icon: Alert02Icon, danger: true },
  ];

  return (
    <section aria-label="Board overview" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon, danger }) => (
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
                className={[
                  "shrink-0 transition-colors duration-200",
                  danger && value > 0
                    ? "text-(--danger)"
                    : "text-(--text-muted) group-hover:text-(--brand)",
                ].join(" ")}
              />
            </div>

            <p
              className={[
                "mt-3 font-mono text-[26px] font-semibold leading-none tracking-tight tabular-nums",
                danger && value > 0
                  ? "text-(--danger)"
                  : "text-(--text-primary)",
              ].join(" ")}
            >
              {pad(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
