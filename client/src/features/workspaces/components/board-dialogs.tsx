import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { DialogShell } from "@/features/workspaces/components/workspace-dialogs";

import { boardApi } from "@/api/dashboard/boardApi";
import { boardKeys } from "@/hooks/dashboard/useBoards";
import { toastSuccess, toastError } from "@/lib/toast";

const inputClass =
  "w-full rounded-lg border border-orange-50/15 bg-white/[0.03] px-3 py-2 text-[13px] text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors duration-200 hover:border-orange-50/25 focus:border-white/25 focus:bg-white/[0.05] focus-visible:outline-none";

const labelClass = "text-[11px] font-medium text-neutral-300";

const cancelClass =
  "flex h-9 cursor-pointer items-center rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/[0.04] hover:text-neutral-100";

const submitClass =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50";

/* ── Rename ─────────────────────────────────────────────────────────────── */

export function RenameBoardDialog({
  boardId,
  currentName,
  onClose,
}: {
  boardId: string;
  currentName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(currentName);

  const save = useMutation({
    mutationFn: () => boardApi.updateBoard(boardId, { name: name.trim() }),
    onSuccess: (board) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toastSuccess("Board renamed", `Now called ${board.name}.`);
      onClose();
    },
    onError: toastError,
  });

  const unchanged = name.trim() === currentName.trim() || name.trim() === "";

  return (
    <DialogShell
      title="Rename board"
      description="Only the name changes, cards stay where they are"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!unchanged) save.mutate();
        }}
        className="p-5"
      >
        <label htmlFor="board-rename" className={labelClass}>
          Name
        </label>
        <input
          id="board-rename"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`mt-1.5 ${inputClass}`}
        />

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={save.isPending || unchanged}
            className={submitClass}
          >
            {save.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Save
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Delete ─────────────────────────────────────────────────────────────── */

export function DeleteBoardDialog({
  boardId,
  boardName,
  onClose,
}: {
  boardId: string;
  boardName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: () => boardApi.deleteBoard(boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toastSuccess("Board deleted", `${boardName} has been removed.`);
      onClose();
    },
    onError: toastError,
  });

  return (
    <DialogShell
      title="Delete board"
      description="This cannot be undone"
      onClose={onClose}
    >
      <div className="p-5">
        <p className="text-[12.5px] leading-5 text-neutral-400">
          <span className="font-medium text-neutral-200">{boardName}</span> and
          every card on it will be removed for everyone in the workspace.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-rose-500 px-4 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {remove.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Delete board
          </button>
        </div>
      </div>
    </DialogShell>
  );
}
