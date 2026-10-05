import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuth } from "@/hooks/auth/useAuth";

import { Avatar } from "@components/layout/board/BoardAvatar";

import { avatarColor } from "@/features/boards/board.helpers";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

const ROLE_OPTIONS = ["owner", "admin", "member", "guest"] as const;

type Role = (typeof ROLE_OPTIONS)[number];

function MemberPage() {
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-members", activeWorkspaceId],
    queryFn: () => workspaceApi.listMembers(activeWorkspaceId!),
    enabled: Boolean(activeWorkspaceId),
  });

  const members = data ?? [];

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["workspace-members", activeWorkspaceId],
    });
  };

  const updateRole = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      workspaceApi.updateMemberRole(activeWorkspaceId!, memberId, role),
    onSuccess: () => {
      setMessage("Role updated.");
      invalidate();
    },
    onError: () => setMessage("Couldn't update that role."),
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) =>
      workspaceApi.removeMember(activeWorkspaceId!, memberId),
    onSuccess: () => {
      setMessage("Member removed.");
      invalidate();
    },
    onError: () => setMessage("Couldn't remove that member."),
  });

  const leaveWorkspace = useMutation({
    mutationFn: () => workspaceApi.leaveWorkspace(activeWorkspaceId!),
    onSuccess: () => setMessage("You have left the workspace."),
    onError: () => setMessage("Couldn't leave the workspace."),
  });

  const busy =
    updateRole.isPending || removeMember.isPending || leaveWorkspace.isPending;

  return (
    <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-white/8 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
            {activeWorkspaceName ?? "Workspace"}
          </p>
          <h1 className="mt-1.5 font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Members
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Everyone with access to this workspace and their role.
          </p>
        </header>

        {message && (
          <p className="mt-4 font-mono text-[11px] text-(--text-secondary)">
            {message}
          </p>
        )}

        {!activeWorkspaceId ? (
          <p className="mt-6 font-mono text-[12px] text-(--text-muted)">
            Select a workspace to see its members.
          </p>
        ) : isLoading ? (
          <div className="mt-6 space-y-2">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-xl border border-white/8 bg-white/4"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-8 text-center font-mono text-[12px] text-(--text-muted)">
            Couldn&apos;t load members. Please try again.
          </p>
        ) : members.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center font-mono text-[12px] text-(--text-muted)">
            No members found.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {members.map((member) => {
              const isSelf = member.userId === user?.id;

              return (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
                >
                  <Avatar
                    member={{
                      id: member.userId,
                      name: member.name ?? undefined,
                      color: avatarColor(member.userId),
                    }}
                    size={32}
                    ring={false}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-medium text-(--text-primary)">
                      {member.name ?? "Unnamed member"}
                      {isSelf && (
                        <span className="ml-2 font-mono text-[10px] text-(--text-muted)">
                          you
                        </span>
                      )}
                    </p>
                    {member.email && (
                      <p className="truncate font-mono text-[11px] text-(--text-muted)">
                        {member.email}
                      </p>
                    )}
                  </div>

                  <select
                    value={member.role}
                    disabled={busy}
                    aria-label={`Role for ${member.name ?? member.userId}`}
                    onChange={(event) =>
                      updateRole.mutate({
                        memberId: member.userId,
                        role: event.target.value as Role,
                      })
                    }
                    className="h-8 shrink-0 rounded-lg border border-white/10 bg-white/4 px-2 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) outline-none hover:border-white/20 disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABEL[role]}
                      </option>
                    ))}
                  </select>

                  {!isSelf && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeMember.mutate(member.userId)}
                      className="shrink-0 rounded-lg border border-(--danger)/40 bg-(--danger)/10 px-2.5 py-1 font-mono text-[10px] text-(--danger) transition-colors hover:bg-(--danger)/20 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {activeWorkspaceId && (
          <div className="mt-8 border-t border-white/8 pt-5">
            <button
              type="button"
              disabled={busy}
              onClick={() => leaveWorkspace.mutate()}
              className="rounded-full border border-white/10 bg-white/4 px-4 py-2 font-mono text-[11px] text-(--text-secondary) transition-colors hover:text-(--text-primary) disabled:opacity-50"
            >
              Leave workspace
            </button>
            <p className="mt-2 font-mono text-[10px] text-(--text-muted)">
              The last owner can&apos;t leave — transfer ownership first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberPage;
