import NotificationPreferences from "@/components/layout/dashboard/NotificationPreferences";

/**
 * Workspace notifications: the channels for this workspace's activity. The
 * account-level version of this page lives at /account/settings/notifications.
 */
function WorkspaceNotificationsPage() {
  return (
    <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-white/8 pb-6">
          <h1 className="font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Workspace notifications
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Choose which workspace events reach you, and through which channels.
          </p>
        </header>

        <NotificationPreferences />
      </div>
    </div>
  );
}

export default WorkspaceNotificationsPage;
