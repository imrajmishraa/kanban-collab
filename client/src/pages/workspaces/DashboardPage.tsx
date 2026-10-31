import ActivitySection from "@/features/dashboard/components/main/ActivitySection";
import DashboardError from "@/features/dashboard/components/main/DashboardError";
import DashboardHeader from "@/features/dashboard/components/main/DashboardHeader";
import DashboardOverview from "@/features/dashboard/components/main/DashboardOverview";
import WorkspaceSection from "@/features/dashboard/components/main/WorkspaceSection";
import DashboardSkeleton from "@/features/dashboard/components/skeletons/DashboardSkeleton";

import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

/**
 * Overview.
 *
 * Not scoped to a single workspace: it summarises every workspace the user
 * belongs to plus the latest activity. Boards live behind the navbar's board
 * switcher, which is why neither the recent-boards list nor an embedded board
 * appears here.
 */
export default function DashboardPage() {
  const {
    data: dashboard,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <DashboardHeader />

        {isLoading && <DashboardSkeleton />}

        {isError && !isLoading && (
          <DashboardError
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        )}

        {!isLoading && !isError && dashboard && (
          <>
            <DashboardOverview
              workspaceCount={dashboard.stats.workspaceCount}
              boardCount={dashboard.stats.boardCount}
              taskCount={dashboard.stats.activeTaskCount}
              memberCount={dashboard.stats.memberCount}
            />

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <WorkspaceSection workspaces={dashboard.workspaces} />
              </div>

              <aside
                aria-label="Recent activity"
                className="xl:sticky xl:top-20 xl:self-start"
              >
                {/* The feed owns its own paging and refresh now. */}
                <ActivitySection />
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
