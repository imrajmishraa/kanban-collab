import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { workspaceApi } from "@/features/workspaces/api/workspaceApi";
import { workspaceKeys } from "@/hooks/useWorkspaces";
import { toastSuccess, toastError } from "@/lib/toast";

import { DialogShell } from "./DialogShell";
import {
  inputClass,
  labelClass,
  cancelClass,
  submitClass,
} from "./dialogClasses";

export function EditWorkspaceDialog({
  workspaceId,
  currentName,
  currentDescription,
  onClose,
}: {
  workspaceId: string;
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
      /* Only send what changed. The endpoint rejects an empty body, and
         sending unchanged fields just risks clobbering a concurrent edit. */
      const payload: { name?: string; description?: string } = {};
      if (nameChanged) payload.name = name.trim();
      if (descriptionChanged) payload.description = description.trim();

      return workspaceApi.updateWorkspace(workspaceId, payload);
    },
    onSuccess: (workspace) => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toastSuccess("Workspace updated", `${workspace.name} has been saved.`);
      onClose();
    },
    onError: toastError,
  });

  return (
    <DialogShell
      title="Edit workspace"
      description="Everyone in the workspace sees these details"
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
            <label htmlFor="workspace-name" className={labelClass}>
              Name
            </label>
            <input
              id="workspace-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="workspace-description" className={labelClass}>
              Description (optional)
            </label>
            <textarea
              id="workspace-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this workspace for?"
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

/* ── Workspace avatar ───────────────────────────────────────────────────── */
