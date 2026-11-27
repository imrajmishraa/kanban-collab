import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { attachmentsApi } from "@/features/boards";
import { workspaceApi } from "@/features/workspaces/api/workspaceApi";
import { workspaceKeys } from "@/hooks/useWorkspaces";
import { toastSuccess, toastError } from "@/lib/toast";

import { DialogShell } from "./DialogShell";
import { cancelClass, submitClass } from "./dialogClasses";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export function WorkspaceAvatarDialog({
  workspaceId,
  currentAvatarUrl,
  workspaceName,
  onClose,
}: {
  workspaceId: string;
  currentAvatarUrl?: string | null;
  workspaceName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (nextFile: File) => {
      // Credentials first, then the bytes go straight to ImageKit.
      const auth = await attachmentsApi.getImageKitAuth();
      const uploaded = await attachmentsApi.uploadToImageKit(nextFile, auth);

      return workspaceApi.updateWorkspace(workspaceId, {
        avatarUrl: uploaded.url,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toastSuccess("Avatar updated", "The new image is now in use.");
      onClose();
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Could not upload the image.",
      );
    },
  });

  const clearAvatar = useMutation({
    mutationFn: () =>
      workspaceApi.updateWorkspace(workspaceId, { avatarUrl: null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toastSuccess("Avatar removed", "The workspace shows its initials again.");
      onClose();
    },
    onError: toastError,
  });

  const pick = (next: File | null) => {
    setError(null);

    if (!next) return;

    if (!next.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    if (next.size > MAX_AVATAR_BYTES) {
      setError("Image must be 4 MB or smaller.");
      return;
    }

    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  const shown = preview ?? currentAvatarUrl ?? null;
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "W";

  return (
    <DialogShell
      title="Workspace avatar"
      description="Shown on your workspace cards and in the switcher"
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--hairline-strong) bg-(--tint-3) text-[20px] font-semibold text-(--text-soft)">
            {shown ? (
              <img src={shown} alt="" className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cancelClass}
            >
              Choose image
            </button>

            <p className="mt-2 text-[11px] text-(--text-subtle)">
              PNG, JPG or WebP, up to 4 MB
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => pick(event.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className="mt-3 text-[11.5px] text-(--danger)">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-2">
          {currentAvatarUrl ? (
            <button
              type="button"
              onClick={() => clearAvatar.mutate()}
              disabled={clearAvatar.isPending}
              className="cursor-pointer text-[11.5px] text-(--text-muted) transition-colors duration-200 hover:text-(--danger) disabled:opacity-50"
            >
              Remove avatar
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={cancelClass}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || save.isPending}
              onClick={() => file && save.mutate(file)}
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
        </div>
      </div>
    </DialogShell>
  );
}

/* ── Create board ───────────────────────────────────────────────────────── */
