import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";

import { attachmentsApi } from "@/api/dashboard/attachmentsApi";
import { boardApi } from "@/api/dashboard/boardApi";
import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { boardKeys } from "@/hooks/dashboard/useBoards";
import { workspaceKeys } from "@/hooks/dashboard/useWorkspaces";
import { toastSuccess, toastError } from "@/lib/toast";

import type { AddWorkspaceMemberPayload } from "@/types/api/dashboard/workspace";

/** The server's own union, so a new role can never be invented here. */
type MemberRole = NonNullable<AddWorkspaceMemberPayload["role"]>;

interface DialogShellProps {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Shared shell: portal, backdrop, Escape, scroll lock. */
export function DialogShell({
  title,
  description,
  onClose,
  children,
}: DialogShellProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-(--scrim) backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-root)/95 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--hairline) px-5 py-4">
          <div>
            <h2 className="text-[14px] font-medium tracking-tight text-(--text-primary)">
              {title}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-(--text-muted)">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-(--text-muted) transition-colors duration-200 hover:border-(--hairline) hover:bg-(--bg-hover) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

const inputClass =
  "w-full rounded-lg border border-(--hairline) bg-(--tint-3) px-3 py-2 text-[13px] text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden transition-colors duration-200 hover:border-(--hairline-strong) focus:border-(--border-strong) focus:bg-(--tint-5) focus-visible:outline-hidden";

const labelClass = "text-[11px] font-medium text-(--text-soft)";

const cancelClass =
  "flex h-9 cursor-pointer items-center rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 text-[12px] text-(--text-soft) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)";

const submitClass =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-[12px] font-semibold text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover) disabled:cursor-not-allowed disabled:opacity-50";

/* ── Add member ─────────────────────────────────────────────────────────── */

export function AddMemberDialog({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");

  const add = useMutation({
    mutationFn: () =>
      workspaceApi.addWorkspaceMember(workspaceId, { email, role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      toastSuccess("Member added", `${email} can now open this workspace.`);
      onClose();
    },
    onError: toastError,
  });

  return (
    <DialogShell
      title="Add member"
      description="Invite someone by the email on their account"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          add.mutate();
        }}
        className="p-5"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="member-email" className={labelClass}>
              Email
            </label>
            <input
              id="member-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="member-role" className={labelClass}>
              Role
            </label>
            <select
              id="member-role"
              value={role}
              onChange={(event) => setRole(event.target.value as MemberRole)}
              className={`mt-1.5 ${inputClass}`}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={cancelClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={add.isPending}
            className={submitClass}
          >
            {add.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Add member
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Edit workspace ─────────────────────────────────────────────────────── */

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
