import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { boardApi } from "@/features/boards";
import { boardKeys } from "@/hooks/useBoards";
import { toastSuccess, toastError } from "@/lib/toast";

import { DialogShell } from "./DialogShell";
import { cancelClass } from "./dialogClasses";

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
        <p className="text-[12.5px] leading-5 text-(--text-secondary)">
          <span className="font-medium text-(--text-primary)">{boardName}</span>{" "}
          and every card on it will be removed for everyone in the workspace.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-(--tint-4) px-4 text-[12px] font-semibold text-(--text-primary) transition-colors duration-200 hover:bg-(--tint-4) disabled:cursor-not-allowed disabled:opacity-50"
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
