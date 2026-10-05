import { useBoardActivity } from "@/hooks/dashboard/useBoardActivity";

import {
  avatarColor,
  formatRelative,
  initials,
} from "@/features/boards/board.helpers";

import type { ActivityEntry } from "@/types/api/dashboard/activity";

interface BoardActivityPanelProps {
  boardId: string | undefined;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  CARD_CREATE: "created a card",
  CARD_UPDATE: "updated a card",
  CARD_MOVE: "moved a card",
  CARD_ARCHIVE: "archived a card",
  CARD_DELETE: "deleted a card",
  CARD_ASSIGN: "assigned a card",
  CARD_UNASSIGN: "unassigned a card",
  COMMENT_ADD: "commented",
  COMMENT_DELETE: "deleted a comment",
  COLUMN_CREATE: "added a column",
  COLUMN_UPDATE: "renamed a column",
  COLUMN_DELETE: "deleted a column",
  BOARD_CREATE: "created the board",
  BOARD_UPDATE: "updated the board",
  BOARD_DELETE: "deleted the board",
  MEMBER_INVITE: "invited a member",
  MEMBER_REMOVE: "removed a member",
  MEMBER_ROLE_CHANGE: "changed a member's role",
};

/** Turn an activity row into a readable sentence. */
function describe(entry: ActivityEntry): string {
  const label = ACTION_LABELS[entry.actionType] ?? "made a change";
  const title = entry.details?.["cardTitle"];

  return typeof title === "string" && title ? `${label} “${title}”` : label;
}

/**
 * Board activity feed (T11) — the read side of `ActivityLogModel`, which the
 * card/column/board controllers were already writing but nothing displayed.
 */
export default function BoardActivityPanel({
  boardId,
  onClose,
}: BoardActivityPanelProps) {
  const activity = useBoardActivity(boardId);

  return (
    <aside className="mt-4 rounded-xl border border-white/8 bg-white/3 p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-(--text-muted)">
          Activity
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] text-(--text-muted) transition-colors hover:text-(--text-primary)"
        >
          Hide
        </button>
      </header>

      <div className="mt-3 space-y-3">
        {activity.isLoading && (
          <p className="font-mono text-[11px] text-(--text-muted)">
            Loading activity…
          </p>
        )}

        {activity.isError && (
          <p className="font-mono text-[11px] text-(--danger)">
            Couldn&apos;t load activity.
          </p>
        )}

        {activity.data?.length === 0 && (
          <p className="font-mono text-[11px] text-(--text-muted)">
            No activity yet.
          </p>
        )}

        {activity.data?.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-semibold text-black"
              style={{ background: avatarColor(entry.userId) }}
            >
              {initials(entry.actorName)}
            </span>

            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-(--text-secondary)">
              <span className="font-semibold text-(--text-primary)">
                {entry.actorName}
              </span>{" "}
              {describe(entry)}
            </p>

            <span className="shrink-0 font-mono text-[10px] text-(--text-muted)">
              {formatRelative(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
