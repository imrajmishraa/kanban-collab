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
    <div className="flex items-center gap-2.5 rounded-lg border border-orange-50/10 bg-white/[0.02] px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[11px] text-neutral-100">
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
    <div className="rounded-lg border border-orange-50/15 bg-white/[0.03] px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-[16px] font-semibold leading-none tabular-nums text-neutral-100">
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
            <h2 className="truncate text-[14px] font-medium tracking-tight text-neutral-100">
              {board.name}
            </h2>
            <span className="rounded-full border border-orange-50/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              {VISIBILITY_LABEL[board.visibility] ?? board.visibility}
            </span>
          </div>

          {board.description && (
            <p className="mt-1.5 max-w-2xl text-[11.5px] leading-5 text-neutral-400">
              {board.description}
            </p>
          )}

          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Updated {formatRelative(board.updatedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/6 px-3 py-1.5 font-mono text-[11px] text-neutral-400"
            title="Members with access to this workspace"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={13} strokeWidth={1.6} />
            <span className="tabular-nums text-neutral-100">{memberCount}</span>
            {memberCount === 1 ? "member" : "members"}
          </span>

          <Link
            to={`/boards/${board.id}`}
            className="group/open inline-flex items-center gap-2 rounded-none rounded-tl-lg rounded-br-lg border border-orange-100/30 bg-orange-100/10 px-3.5 py-1.5 text-[11px] text-orange-100 transition-colors duration-200 hover:border-orange-100/45 hover:bg-orange-100/15 hover:text-neutral-100"
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
                className="rounded-lg border border-orange-50/10 bg-white/[0.02] p-3"
              >
                <div className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />
                <div className="mt-2 h-8 w-full animate-pulse rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : columnCount === 0 ? (
          <p className="rounded-lg border border-dashed border-orange-50/20 px-3 py-5 text-center font-mono text-[11px] text-neutral-500">
            No columns yet.
          </p>
        ) : (
          columns.map((column) => (
            <div
              key={column.id}
              className="rounded-lg border border-orange-50/15 bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-100">
                  {column.name}
                </h3>
                <span className="rounded-full border border-orange-50/15 bg-white/[0.04] px-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
                  {column.cards.length}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                {column.cards.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/8 px-2.5 py-2 text-center font-mono text-[10px] uppercase tracking-wide text-neutral-500">
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
