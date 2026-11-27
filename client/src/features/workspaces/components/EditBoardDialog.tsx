import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { boardApi } from "@/features/boards";
import { boardKeys } from "@/hooks/useBoards";
import { toastSuccess, toastError } from "@/lib/toast";

import { DialogShell } from "./DialogShell";
import {
  inputClass,
  labelClass,
  cancelClass,
  submitClass,
} from "./dialogClasses";

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
            <p className="mt-1.5 text-[11px] text-(--text-subtle)">
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
