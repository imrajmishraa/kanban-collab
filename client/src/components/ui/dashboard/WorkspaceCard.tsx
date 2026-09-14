import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  DashboardSquare01Icon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";

import { alpha, getWorkspaceColor } from "@/utils/workspaceColor";

interface WorkspaceCardProps {
  id: string;
  name: string;
  boardCount: number;
  activeTaskCount: number;
}

export default function WorkspaceCard({
  id,
  name,
  boardCount,
  activeTaskCount,
}: WorkspaceCardProps) {
  const navigate = useNavigate();
  const color = getWorkspaceColor(id || name);

  const cardStyle: CSSProperties = {
    backgroundColor: "var(--bg-card)",
    backgroundImage: `linear-gradient(
      180deg,
      ${alpha(color, 0.1)} 0%,
      ${alpha(color, 0.03)} 45%,
      transparent 100%
    )`,
    borderColor: alpha(color, 0.22),
  };

  return (
    <button
      type="button"
      onClick={() => navigate(`/workspaces/${id}`)}
      style={cardStyle}
      className="
        group relative flex w-full cursor-pointer flex-col overflow-hidden
        rounded-xl border text-left
        transition-all duration-200
        hover:-translate-y-0.5
      "
    >
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0 z-20 h-px
          bg-linear-to-r from-transparent via-white/20 to-transparent
        "
      />

      <span
        aria-hidden="true"
        className="relative z-10 block h-1 w-full"
        style={{ backgroundColor: color }}
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-8 -top-8 z-0
          size-32 rounded-full blur-2xl
          opacity-50 transition-opacity duration-300
          group-hover:opacity-90
        "
        style={{
          background: `radial-gradient(circle, ${alpha(color, 0.35)} 0%, transparent 70%)`,
        }}
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 rounded-xl
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
        style={{
          boxShadow: `0 0 0 1px ${alpha(color, 0.4)}, 0 10px 30px -10px ${alpha(color, 0.5)}`,
        }}
      />

      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2.5">
          <span
            className="
              flex size-7 shrink-0 items-center justify-center
              rounded-md border transition-colors duration-200
            "
            style={{
              backgroundColor: alpha(color, 0.14),
              borderColor: alpha(color, 0.32),
              color,
            }}
          >
            <HugeiconsIcon icon={Folder01Icon} size={14} strokeWidth={1.6} />
          </span>

          <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-(--text-primary)">
            {name}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatChip
            icon={DashboardSquare01Icon}
            value={boardCount}
            label="boards"
            color={color}
          />
          <StatChip
            icon={CheckListIcon}
            value={activeTaskCount}
            label="tasks"
            color={color}
          />
        </div>
      </div>
    </button>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: typeof DashboardSquare01Icon;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <span
      className="
        inline-flex items-center gap-1.5 rounded-full border
        px-2 py-0.5 font-mono text-[10px]
      "
      style={{
        backgroundColor: alpha(color, 0.1),
        borderColor: alpha(color, 0.24),
        color: alpha(color, 0.95),
      }}
    >
      <HugeiconsIcon icon={icon} size={11} strokeWidth={1.8} />
      <span className="tabular-nums">{value}</span>
      <span className="uppercase tracking-[0.12em] opacity-80">{label}</span>
    </span>
  );
}
