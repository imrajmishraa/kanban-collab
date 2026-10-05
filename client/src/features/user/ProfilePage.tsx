import { Link } from "react-router-dom";

import { Avatar } from "@components/layout/board/BoardAvatar";

import { avatarColor, initials } from "@/features/boards/board.helpers";
import { useAuth } from "@/hooks/auth/useAuth";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { getWorkspaceColor, alpha } from "@/utils/workspaceColor";

function ProfilePage() {
  const { user } = useAuth();
  const { workspaces } = useWorkspaces();

  return (
    <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-white/8 pb-6">
          <h1 className="font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Profile
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Your account details and the workspaces you belong to.
          </p>
        </header>

        {/* Identity card */}
        <section className="mt-6 flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-5">
          {user ? (
            <Avatar
              member={{
                id: user.id,
                name: user.fullName,
                color: avatarColor(user.id),
              }}
              size={56}
              ring={false}
            />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-white/6 font-mono text-[18px] text-(--text-muted)">
              ?
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate font-mono text-[16px] font-semibold text-(--text-primary)">
              {user?.fullName ?? "Signed out"}
            </p>
            <p className="truncate font-mono text-[12px] text-(--text-muted)">
              {user?.email ?? "—"}
            </p>
            {user && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </p>
            )}
          </div>
        </section>

        {/* Workspaces */}
        <section className="mt-6">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
            Workspaces
          </h2>

          {workspaces.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-8 text-center font-mono text-[12px] text-(--text-muted)">
              You're not a member of any workspace yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {workspaces.map((workspace) => {
                const color = getWorkspaceColor(workspace.id || workspace.name);
                return (
                  <li key={workspace.id}>
                    <Link
                      to={`/workspaces/${workspace.id}`}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-colors hover:border-white/14 hover:bg-white/5"
                    >
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-semibold"
                        style={{
                          backgroundColor: alpha(color, 0.14),
                          borderColor: alpha(color, 0.32),
                          color,
                        }}
                      >
                        {initials(workspace.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[13px] font-medium text-(--text-primary)">
                          {workspace.name}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                          {workspace.members.length} member
                          {workspace.members.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
