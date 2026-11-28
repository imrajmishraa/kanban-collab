import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { workspaceApi, WorkspaceDeletionNotice } from "@/features/workspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { NotificationPreferences } from "@/features/dashboard";
import { usePanelState } from "@/stores/panelState";
import { RIGHT_PANEL_MODES } from "@/stores/rightPanelTypes";

function SettingsPage() {
  const { user } = useAuth();
  const { activeWorkspaceId, activeWorkspaceName, clearActiveWorkspace } =
    useActiveWorkspace();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data: workspace } = useWorkspace(activeWorkspaceId);
  const deletionPending = workspace?.status === "deletion_pending";

  /* Layout, not workspace data: this is stored per browser and applies to every
     workspace the reader opens. */
  const rightPanelMode = usePanelState((state) => state.rightPanel.mode);
  const setRightPanelMode = usePanelState((state) => state.rightPanel.setMode);

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
        <header className="border-b border-(--border) pb-6">
          <h1 className="font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Settings
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Manage your account and workspace preferences.
          </p>
        </header>

        {activeWorkspaceId && (
          <WorkspaceDeletionNotice
            workspaceId={activeWorkspaceId}
            className="mt-6"
          />
        )}

        {/* Account */}
        <section className="mt-6 rounded-xl border border-(--border) bg-(--tint-3) p-5">
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

          {deletionPending ? (
            <p className="mt-3 font-mono text-[12px] text-(--text-muted)">
              This workspace is already scheduled for deletion — cancel it above
              to keep it.
            </p>
          ) : activeWorkspaceId ? (
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
                    className="h-9 rounded-full border border-(--border) bg-(--tint-6) px-4 font-mono text-[11px] text-(--text-secondary) transition-colors hover:text-(--text-primary)"
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

        {/* Layout */}
        <section className="mt-6 rounded-xl border border-(--border) bg-(--tint-3) p-5">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
            Appearance
          </h2>

          <p className="mt-3 max-w-prose font-mono text-[12px] leading-relaxed text-(--text-secondary)">
            The right column is off by default. The bell in the navbar opens the
            same inbox as it always has; turning the column on gives it a
            permanent home from 1024px up. This is a per-browser preference, not
            a workspace setting.
          </p>

          <div
            role="radiogroup"
            aria-label="Right column"
            className="mt-4 grid gap-2 sm:grid-cols-2"
          >
            {RIGHT_PANEL_MODES.map((option) => {
              const checked = option.mode === rightPanelMode;

              return (
                <button
                  key={option.mode}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setRightPanelMode(option.mode)}
                  className={[
                    "rounded-lg border p-3 text-left transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-(--brand)",
                    checked
                      ? "border-(--brand) bg-(--bg-hover)"
                      : "border-(--border) hover:bg-(--bg-hover)",
                  ].join(" ")}
                >
                  <span className="block font-mono text-[12px] text-(--text-primary)">
                    {option.label}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] leading-relaxed text-(--text-muted)">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <NotificationPreferences />
      </div>
    </div>
  );
}

export default SettingsPage;
