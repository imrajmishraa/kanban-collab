import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { workspaceApi } from "@/features/workspaces/api/workspaceApi";
import { workspaceKeys } from "@/hooks/useWorkspaces";
import { toastSuccess, toastError } from "@/lib/toast";
import type { AddWorkspaceMemberPayload } from "@/types/workspace";

import { DialogShell } from "./DialogShell";
import {
  inputClass,
  labelClass,
  cancelClass,
  submitClass,
} from "./dialogClasses";

type MemberRole = NonNullable<AddWorkspaceMemberPayload["role"]>;

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
