import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import { Avatar } from "@components/layout/board/BoardAvatar";

import { avatarColor } from "@/features/boards/board.helpers";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

function MemberPage() {
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-members", activeWorkspaceId],
    queryFn: () => workspaceApi.listMembers(activeWorkspaceId!),
    enabled: Boolean(activeWorkspaceId),
  });

  const members = data ?? [];

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
            Couldn't load members. Please try again.
          </p>
        ) : members.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center font-mono text-[12px] text-(--text-muted)">
            No members found.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {members.map((member) => (
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
                  </p>
                  {member.email && (
                    <p className="truncate font-mono text-[11px] text-(--text-muted)">
                      {member.email}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary)">
                  {ROLE_LABEL[member.role] ?? member.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MemberPage;
