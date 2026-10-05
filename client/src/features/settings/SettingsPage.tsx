import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuth } from "@/hooks/auth/useAuth";

function SettingsPage() {
  const { user } = useAuth();
  const { activeWorkspaceId, activeWorkspaceName, clearActiveWorkspace } =
    useActiveWorkspace();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const deleteWorkspace = useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceApi.deleteWorkspace(workspaceId),
    onSuccess: () => {
      setMessage(
        "Workspace scheduled for deletion. You'll get a confirmation once the grace period ends.",
      );
      clearActiveWorkspace();
      setConfirming(false);
    },
    onError: () => {
      setMessage("Couldn't schedule deletion. Please try again.");
      setConfirming(false);
    },
  });

  return (
    <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-white/8 pb-6">
          <h1 className="font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Settings
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Manage your account and workspace preferences.
          </p>
        </header>

        {/* Account */}
        <section className="mt-6 rounded-xl border border-white/8 bg-white/3 p-5">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
            Account
          </h2>
          <dl className="mt-3 space-y-2 font-mono text-[12px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-(--text-muted)">Name</dt>
              <dd className="truncate text-(--text-primary)">
                {user?.fullName ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-(--text-muted)">Email</dt>
              <dd className="truncate text-(--text-primary)">
                {user?.email ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-(--text-muted)">Email verified</dt>
              <dd className="text-(--text-primary)">
                {user?.emailVerified ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Workspace danger zone */}
        <section className="mt-6 rounded-xl border border-(--danger)/30 bg-(--danger)/5 p-5">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--danger)">
            Danger zone
          </h2>
          <p className="mt-2 font-mono text-[12px] leading-5 text-(--text-secondary)">
            Deleting a workspace schedules it for removal after a grace period.
            All of its boards and cards are removed with it.
          </p>

          {activeWorkspaceId ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {confirming ? (
                <>
                  <span className="font-mono text-[12px] text-(--text-primary)">
                    Delete “{activeWorkspaceName}”?
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteWorkspace.mutate(activeWorkspaceId)}
                    disabled={deleteWorkspace.isPending}
                    className="h-9 rounded-full border border-(--danger)/40 bg-(--danger)/10 px-4 font-mono text-[11px] text-(--danger) transition-colors hover:bg-(--danger)/20 disabled:opacity-50"
                  >
                    {deleteWorkspace.isPending ? "Scheduling…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="h-9 rounded-full border border-white/8 bg-white/6 px-4 font-mono text-[11px] text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="h-9 rounded-full border border-(--danger)/40 bg-(--danger)/10 px-4 font-mono text-[11px] text-(--danger) transition-colors hover:bg-(--danger)/20"
                >
                  Delete workspace
                </button>
              )}
            </div>
          ) : (
            <p className="mt-3 font-mono text-[12px] text-(--text-muted)">
              Select a workspace first.
            </p>
          )}

          {message && (
            <p className="mt-3 font-mono text-[11px] text-(--text-secondary)">
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
