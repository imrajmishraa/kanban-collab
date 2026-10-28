import { useNavigate } from "react-router-dom";

import ActivitySection from "@components/layout/dashboard/main/ActivitySection";
import DashboardError from "@components/layout/dashboard/main/DashboardError";
import DashboardHeader from "@components/layout/dashboard/main/DashboardHeader";
import DashboardOverview from "@components/layout/dashboard/main/DashboardOverview";
import WorkspaceSection from "@components/layout/dashboard/main/WorkspaceSection";
import DashboardSkeleton from "@components/ui/dashboard/skeletons/DashboardSkeleton";

import { useDashboard } from "@/hooks/dashboard/useDashboard";

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

  const navigate = useNavigate();

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
            />

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <WorkspaceSection workspaces={dashboard.workspaces} />
              </div>

              <aside
                aria-label="Recent activity"
                className="xl:sticky xl:top-20 xl:self-start"
              >
                <ActivitySection
                  activities={dashboard.recentActivity}
                  isRefreshing={isFetching}
                  onRefresh={() => void refetch()}
                  onOpenBoard={(boardId) => navigate(`/boards/${boardId}`)}
                />
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
