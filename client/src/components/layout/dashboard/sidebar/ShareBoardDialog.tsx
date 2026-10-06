import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";

import { boardApi } from "@/api/dashboard/boardApi";

interface ShareBoardDialogProps {
  boardId: string;
  boardName?: string;
  onClose: () => void;
}

/**
 * Share a board by inviting a teammate (T14). Board access is workspace-scoped,
 * so the invite grants workspace membership and notifies the invitee.
 */
export function ShareBoardDialog({
  boardId,
  boardName,
  onClose,
}: ShareBoardDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "guest">("member");
  const [result, setResult] = useState<string | null>(null);

  const share = useMutation({
    mutationFn: () =>
      boardApi.shareBoard(boardId, { email: email.trim(), role }),
    onSuccess: (sharedWith) =>
      setResult(`${sharedWith.name || sharedWith.userId} now has access.`),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || share.isPending) return;
    share.mutate();
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share board"
        className="relative w-[min(440px,100%)] rounded-xl border border-white/10 bg-(--bg-elevated) p-5 shadow-2xl shadow-black/60"
      >
        <h2 className="font-mono text-[13px] font-semibold text-(--text-primary)">
          Share &ldquo;{boardName ?? "board"}&rdquo;
        </h2>
        <p className="mt-1 font-mono text-[11px] leading-5 text-(--text-muted)">
          Invite a teammate by email. They join this board&apos;s workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label
            htmlFor="share-email"
            className="block font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)"
          >
            Email
          </label>
          <input
            id="share-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@example.com"
            className="mt-1 h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 font-mono text-[12px] text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) hover:border-white/14 focus:border-(--brand-border)"
          />

          <label
            htmlFor="share-role"
            className="mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)"
          >
            Role
          </label>
          <select
            id="share-role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "member" | "guest")
            }
            className="mt-1 h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 font-mono text-[12px] text-(--text-primary) outline-none hover:border-white/14"
          >
            <option value="member">Member</option>
            <option value="guest">Guest (read-only)</option>
          </select>

          {share.isError && (
            <p className="mt-3 font-mono text-[11px] text-(--danger)">
              Couldn&apos;t share — check the email and your permissions.
            </p>
          )}

          {result && (
            <p className="mt-3 font-mono text-[11px] text-(--success)">
              {result}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/8 bg-white/6 px-3 py-2 font-mono text-[11px] text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!email.trim() || share.isPending}
              className="rounded-lg border border-(--brand-border) bg-(--brand)/10 px-4 py-2 font-mono text-[11px] font-semibold text-(--text-primary) transition-colors hover:bg-(--brand)/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {share.isPending ? "Sharing…" : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
