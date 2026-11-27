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

export function CreateBoardDialog({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: () =>
      boardApi.createBoard({
        workspaceId,
        name,
        ...(description.trim() ? { description: description.trim() } : {}),
      }),
    onSuccess: (board) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toastSuccess("Board created", `${board.name} is ready.`);
      onClose();
    },
    onError: toastError,
  });

  return (
    <DialogShell
      title="Create board"
      description="Boards hold the columns and cards for one project"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
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
              placeholder="Roadmap"
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
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className={submitClass}
          >
            {create.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Create board
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
