import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import type { DashboardBoard } from "@/types/dashboard/dashboard";

interface RecentBoardsSectionProps {
  boards: DashboardBoard[];
}

/* ── Helpers ───────────────────────────────────────────────── */

const FALLBACK = "#7C5CFC";

const alpha = (color: string | undefined, a: number): string => {
  const c = color ?? FALLBACK;
  if (/^#([0-9a-f]{6})$/i.test(c)) {
    const hex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    return `${c}${hex}`;
  }
  return c;
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

/** BRD-<last 4 of id, uppercased>. Falls back to a stable hash. */
const boardShortId = (id: string) => {
  const tail = id
    .replace(/[^a-z0-9]/gi, "")
    .slice(-4)
    .toUpperCase();
  return `BRD-${tail.padStart(3, "0")}`;
};

/** First two alphanumerics of a name, uppercased. */
const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/* ── Section ───────────────────────────────────────────────── */

export default function RecentBoardsSection({
  boards,
}: RecentBoardsSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
            Boards
          </p>
          <h2 className="mt-1.5 font-mono text-[13px] font-semibold text-(--text-primary)">
            Recent boards
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate("/boards")}
          className="
            group/view flex cursor-pointer items-center gap-1.5
            rounded-md px-2 py-1
            font-mono text-[10px] uppercase tracking-[0.14em]
            text-(--text-muted)
            transition-colors duration-200
            hover:bg-white/4 hover:text-(--text-primary)
          "
        >
          <span>View all</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={11}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover/view:translate-x-0.5"
          />
        </button>
      </div>

      {/* Body */}
      {boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center">
          <p className="font-mono text-[12px] text-(--text-muted)">
            No boards found.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, index) => (
            <BoardCard
              key={board.id}
              board={board}
              featured={index === 0}
              onOpen={() => navigate(`/boards/${board.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Board card ────────────────────────────────────────────── */

function BoardCard({
  board,
  featured = false,
  onOpen,
}: {
  board: DashboardBoard;
  featured?: boolean;
  onOpen: () => void;
}) {
  const color = board.backgroundColor || FALLBACK;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={featured ? { borderColor: alpha(color, 0.55) } : undefined}
      className={[
        "group relative flex w-full cursor-pointer flex-col overflow-hidden",
        "rounded-xl border bg-white/3 p-3.5 text-left",
        "transition-colors duration-200",
        featured
          ? "hover:bg-white/5.5"
          : "border-white/8 hover:border-white/14 hover:bg-white/5.5",
      ].join(" ")}
    >
      {/* Category-style workspace badge */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            inline-flex items-center gap-1.5
            rounded-md border px-2 py-1
            font-mono text-[10px] font-semibold uppercase tracking-[0.12em]
          "
          style={{
            backgroundColor: alpha(color, 0.12),
            borderColor: alpha(color, 0.34),
            color: alpha(color, 1),
          }}
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {board.workspaceName}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 font-mono text-[15px] font-semibold leading-snug text-(--text-primary)">
        {board.name}
      </h3>

      {/* Meta row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tabular-nums tracking-wider text-(--text-muted)">
          {boardShortId(board.id)}
        </span>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-(--text-muted)">
            {formatRelative(board.updatedAt)}
          </span>

          {/* Initials avatar */}
          <span
            className="
              flex size-6 shrink-0 items-center justify-center
              rounded-full border border-white/10 bg-white/4
              font-mono text-[9px] font-semibold tracking-wider
              text-(--text-secondary)
            "
          >
            {initials(board.name)}
          </span>
        </div>
      </div>
    </button>
  );
}
