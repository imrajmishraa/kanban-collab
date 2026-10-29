import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Share08Icon } from "@hugeicons/core-free-icons";

import { DialogShell } from "@/features/workspaces/components/workspace-dialogs";

import { boardApi } from "@/api/dashboard/boardApi";

interface ShareBoardDialogProps {
  boardId: string;
  boardName?: string;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-lg border border-orange-50/15 bg-white/[0.03] px-3 py-2 text-[13px] text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors duration-200 hover:border-orange-50/25 focus:border-white/25 focus:bg-white/[0.05] focus-visible:outline-none";

const labelClass = "text-[11px] font-medium text-neutral-300";

/**
 * Share a board by inviting a teammate (T14). Board access is workspace-scoped,
 * so the invite grants workspace membership and notifies the invitee.
 *
 * Uses the shared dialog shell so it matches every other dialog: the old copy
 * carried its own portal with `z-100`, which is not a valid Tailwind class.
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

  return (
    <DialogShell
      title="Share board"
      description={`Invite someone to ${boardName ?? "this board"}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="share-email" className={labelClass}>
              Email
            </label>
            <input
              id="share-email"
              type="email"
              autoFocus
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setResult(null);
              }}
              placeholder="teammate@example.com"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="share-role" className={labelClass}>
              Access
            </label>
            <select
              id="share-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "member" | "guest")
              }
              className={`mt-1.5 ${inputClass}`}
            >
              <option value="member">Can edit</option>
              <option value="guest">Can view</option>
            </select>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-4 text-neutral-600">
          They join this board&apos;s workspace, so they can see the other
          boards there too.
        </p>

        {share.isError && (
          <p className="mt-3 text-[11.5px] text-rose-300">
            Could not share. Check the email and your permissions.
          </p>
        )}

        {result && (
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-orange-100">
            <HugeiconsIcon icon={Share08Icon} size={12} strokeWidth={1.8} />
            {result}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 cursor-pointer items-center rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
          >
            {result ? "Done" : "Cancel"}
          </button>

          <button
            type="submit"
            disabled={!email.trim() || share.isPending}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {share.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={13}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Share
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
