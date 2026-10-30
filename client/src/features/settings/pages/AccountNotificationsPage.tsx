import NotificationPreferences from "@/components/layout/dashboard/NotificationPreferences";

/**
 * Account notifications: what reaches the person, regardless of which
 * workspace they are in. Workspace-level channels live under the workspace's
 * own settings.
 */
function AccountNotificationsPage() {
  return (
    <div className="min-h-screen bg-(--bg-root) px-6 py-10 text-(--text-primary)">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-b border-(--border) pb-6">
          <h1 className="font-mono text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Account notifications
          </h1>
          <p className="mt-1 max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
            Choose what reaches you about your own account, and how often.
          </p>
        </header>

        <NotificationPreferences />
      </div>
    </div>
  );
}

export default AccountNotificationsPage;
