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

/* ── Edit board ─────────────────────────────────────────────────────────── */

export function EditBoardDialog({
  boardId,
  currentName,
  currentDescription,
  onClose,
}: {
  boardId: string;
  currentName: string;
  currentDescription?: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");

  const nameChanged = name.trim() !== currentName.trim() && name.trim() !== "";
  const descriptionChanged =
    description.trim() !== (currentDescription ?? "").trim();
  const dirty = nameChanged || descriptionChanged;

  const save = useMutation({
    mutationFn: () => {
      const payload: { name?: string; description?: string } = {};
      if (nameChanged) payload.name = name.trim();
      if (descriptionChanged) payload.description = description.trim();

      return boardApi.updateBoard(boardId, payload);
    },
    onSuccess: (board) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toastSuccess("Board updated", `${board.name} has been saved.`);
      onClose();
    },
    onError: toastError,
  });

  return (
    <DialogShell
      title="Edit board"
      description="Name and description are visible to everyone in the workspace"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (dirty) save.mutate();
        }}
        className="p-5"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="board-name" className={labelClass}>
              Name
            </label>
            <input
              id="board-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="board-description" className={labelClass}>
              Description (optional)
            </label>
            <textarea
              id="board-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this board for?"
              className={`mt-1.5 resize-none ${inputClass}`}
            />
            <p className="mt-1.5 text-[11px] text-neutral-600">
              {description.trim().length}/500
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={save.isPending || !dirty}
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

/* ── Edit column ────────────────────────────────────────────────────────── */

export function EditColumnDialog({
  currentName,
  currentDescription,
  onSave,
  onClose,
}: {
  currentName: string;
  currentDescription?: string | null;
  onSave: (values: { name: string; description: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");

  const dirty =
    name.trim() !== currentName.trim() ||
    description.trim() !== (currentDescription ?? "").trim();

  return (
    <DialogShell
      title="Edit column"
      description="Rename the column or note what belongs in it"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onSave({ name: name.trim(), description: description.trim() });
          onClose();
        }}
        className="p-5"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="column-name" className={labelClass}>
              Name
            </label>
            <input
              id="column-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="column-description" className={labelClass}>
              Description (optional)
            </label>
            <textarea
              id="column-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What goes in this column?"
              className={`mt-1.5 resize-none ${inputClass}`}
            />
            <p className="mt-1.5 text-[11px] text-neutral-600">
              {description.trim().length}/300
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button type="submit" disabled={!dirty} className={submitClass}>
            Save
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Add column ─────────────────────────────────────────────────────────── */

export function AddColumnDialog({
  suggestedName,
  onCreate,
  onClose,
}: {
  suggestedName: string;
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(suggestedName);

  return (
    <DialogShell
      title="Add column"
      description="Columns group the cards on this board"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          onClose();
        }}
        className="p-5"
      >
        <label htmlFor="column-name" className={labelClass}>
          Name
        </label>
        <input
          id="column-name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="In progress"
          className={`mt-1.5 ${inputClass}`}
        />

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()} className={submitClass}>
            Add column
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
