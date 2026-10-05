import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";

import { AvatarStack } from "@components/layout/board/BoardAvatar";

import {
  formatDue,
  formatRelative,
  isOverdue,
  labelColor,
  ui,
} from "@/features/boards/board.helpers";

import type {
  Board,
  BoardCard,
  BoardDetails,
} from "@/types/api/dashboard/board";

interface WorkspaceBoardCardProps {
  board: Board;
  details: BoardDetails | undefined;
  isLoadingDetails: boolean;
  /** Members with access to the workspace (per the workspace member list). */
  memberCount: number;
}

const VISIBILITY_LABEL: Record<string, string> = {
  private: "Private",
  workspace: "Workspace",
  public: "Public",
};

function CardRow({ card }: { card: BoardCard }) {
  const overdue = isOverdue(card.dueDate);

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[11px] text-(--text-primary)">
          {card.title}
        </p>

        {card.labels.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {card.labels.map((item) => (
              <span
                key={item}
                className="rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
                style={{
                  color: labelColor(item),
                  background: `${labelColor(item)}1f`,
                  border: `1px solid ${labelColor(item)}40`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {card.dueDate && (
        <span
          className="shrink-0 font-mono text-[9px] tabular-nums"
          style={{ color: overdue ? "var(--danger)" : "var(--text-muted)" }}
        >
          {formatDue(card.dueDate)}
        </span>
      )}

      <AvatarStack ids={card.members} size={18} max={3} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--text-muted)">
        {label}
      </p>
      <p className="mt-1 font-mono text-[16px] font-semibold leading-none tabular-nums text-(--text-primary)">
        {value}
      </p>
    </div>
  );
}

export default function WorkspaceBoardCard({
  board,
  details,
  isLoadingDetails,
  memberCount,
}: WorkspaceBoardCardProps) {
  const columns = details
    ? [...details.columns].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];
  const columnCount = columns.length;
  const cardCount = columns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );

  return (
    <section className={[ui.panel, "p-4 sm:p-5"].join(" ")}>
      <span aria-hidden="true" className={ui.hairline} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-mono text-[15px] font-semibold text-(--text-primary)">
              {board.name}
            </h2>
            <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-(--text-muted)">
              {VISIBILITY_LABEL[board.visibility] ?? board.visibility}
            </span>
          </div>

          {board.description && (
            <p className="mt-1.5 max-w-2xl font-mono text-[11px] leading-5 text-(--text-secondary)">
              {board.description}
            </p>
          )}

          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
            Updated {formatRelative(board.updatedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/6 px-3 py-1.5 font-mono text-[11px] text-(--text-secondary)"
            title="Members with access to this workspace"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={13} strokeWidth={1.6} />
            <span className="tabular-nums text-(--text-primary)">
              {memberCount}
            </span>
            {memberCount === 1 ? "member" : "members"}
          </span>

          <Link
            to={`/boards/${board.id}`}
            className="group/open inline-flex items-center gap-2 rounded-full border border-(--brand-border) bg-(--brand-muted) px-3.5 py-1.5 font-mono text-[11px] text-(--brand-hover) transition-colors duration-200 hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary)"
          >
            Open board
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover/open:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Columns" value={columnCount} />
        <MiniStat label="Cards" value={cardCount} />
        <MiniStat label="Members" value={memberCount} />
      </div>

      {/* Columns + cards */}
      <div className="mt-4 space-y-3">
        {isLoadingDetails ? (
          <div className="space-y-3">
            {[0, 1].map((row) => (
              <div
                key={row}
                className="rounded-lg border border-white/6 bg-white/2 p-3"
              >
                <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-8 w-full animate-pulse rounded bg-white/6" />
              </div>
            ))}
          </div>
        ) : columnCount === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 bg-white/2 px-3 py-5 text-center font-mono text-[11px] text-(--text-muted)">
            No columns yet.
          </p>
        ) : (
          columns.map((column) => (
            <div
              key={column.id}
              className="rounded-lg border border-white/8 bg-white/3 p-3"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-primary)">
                  {column.name}
                </h3>
                <span className="rounded-full border border-white/10 bg-white/4 px-1.5 font-mono text-[10px] tabular-nums text-(--text-muted)">
                  {column.cards.length}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                {column.cards.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/8 px-2.5 py-2 text-center font-mono text-[10px] uppercase tracking-wide text-(--text-muted)">
                    No cards
                  </p>
                ) : (
                  column.cards
                    .slice()
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((card) => <CardRow key={card.id} card={card} />)
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
