import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workspaceApi } from "@/features/workspaces/api/workspaceApi";
import { describeDeletion } from "@/features/workspaces/utils/deletionNotice";
import { workspaceKeys } from "@/hooks/useWorkspaces";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";

interface WorkspaceDeletionNoticeProps {
  workspaceId: string;
  /** Hide the cancel button (e.g. on a read-only surface). */
  showAction?: boolean;
  className?: string;
}

/**
 * Banner for a workspace that is counting down to deletion.
 *
 * Renders nothing unless the workspace is actually `deletion_pending`, so it can
 * be dropped into any workspace surface without a guard at the call site.
 *
 * The server has refused writes in a pending workspace since #8/#9; without this
 * banner those requests fail with a 409 the user cannot interpret, and the
 * cancel endpoint has no way in.
 */
export function WorkspaceDeletionNotice({
  workspaceId,
  showAction = true,
  className = "",
}: WorkspaceDeletionNoticeProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: workspace } = useWorkspace(workspaceId);
  const [message, setMessage] = useState<string | null>(null);

  const cancel = useMutation({
    mutationFn: () => workspaceApi.cancelWorkspaceDeletion(workspaceId),
    onSuccess: () => {
      setMessage("Deletion cancelled — the workspace is active again.");
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
    onError: () => {
      setMessage("Couldn't cancel the deletion. Please try again.");
    },
  });

  if (!workspace || workspace.status !== "deletion_pending") return null;

  const notice = describeDeletion(workspace.deletionScheduledFor);
  const isOwner = Boolean(user?.id) && workspace.ownerId === user?.id;

  return (
    <div
      role="status"
      className={`rounded-xl border border-(--danger)/30 bg-(--danger)/5 p-4 ${className}`}
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--danger)">
        Scheduled for deletion
      </p>

      <p className="mt-2 font-mono text-[12px] leading-5 text-(--text-primary)">
        {notice?.label ??
          "This workspace is scheduled for deletion and is read-only."}
      </p>

      {showAction && isOwner && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="h-9 cursor-pointer rounded-full border border-(--border-strong) bg-(--tint-6) px-4 font-mono text-[11px] text-(--text-primary) transition-colors hover:bg-(--bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancel.isPending ? "Cancelling…" : "Cancel deletion"}
          </button>
          <span className="font-mono text-[11px] text-(--text-muted)">
            Keeps every board, card and note.
          </span>
        </div>
      )}

      {showAction && !isOwner && (
        <p className="mt-2 font-mono text-[11px] text-(--text-muted)">
          Only the workspace owner can cancel this.
        </p>
      )}

      {message && (
        <p className="mt-2 font-mono text-[11px] text-(--text-secondary)">
          {message}
        </p>
      )}
    </div>
  );
}
