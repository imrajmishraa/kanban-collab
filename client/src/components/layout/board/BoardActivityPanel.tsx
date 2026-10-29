import { useBoardActivity } from "@/hooks/dashboard/useBoardActivity";

import { Avatar } from "./BoardAvatar";

import { avatarColor, formatRelative } from "@/features/boards/board.helpers";

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
    <aside className="mt-4 rounded-xl border border-orange-50/15 bg-white/3 p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Activity
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] text-neutral-500 transition-colors hover:text-neutral-100"
        >
          Hide
        </button>
      </header>

      <div className="mt-3 space-y-3">
        {activity.isLoading && (
          <p className="font-mono text-[11px] text-neutral-500">
            Loading activity…
          </p>
        )}

        {activity.isError && (
          <p className="font-mono text-[11px] text-(--danger)">
            Couldn&apos;t load activity.
          </p>
        )}

        {activity.data?.length === 0 && (
          <p className="font-mono text-[11px] text-neutral-500">
            No activity yet.
          </p>
        )}

        {activity.data?.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2.5">
            {/* The payload has carried actorAvatarUrl all along; the panel
                was drawing initials and ignoring it. */}
            <Avatar
              member={{
                id: entry.userId,
                name: entry.actorName,
                avatarUrl: entry.actorAvatarUrl ?? null,
                color: avatarColor(entry.userId),
              }}
              size={24}
              ring={false}
            />

            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-100">
                {entry.actorName}
              </span>{" "}
              {describe(entry)}
            </p>

            <span className="shrink-0 font-mono text-[10px] text-neutral-500">
              {formatRelative(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
