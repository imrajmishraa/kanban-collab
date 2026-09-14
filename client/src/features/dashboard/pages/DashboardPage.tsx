import DashboardHeader from "@components/layout/dashboard/main/DashboardHeader";
import DashboardOverview from "@components/layout/dashboard/main/DashboardOverview";
import ActivitySection from "@components/layout/dashboard/main/ActivitySection";
import RecentBoardsSection from "@components/layout/dashboard/main/RecentBoardsSection";
import WorkspaceSection from "@components/layout/dashboard/main/WorkspaceSection";

import DashboardError from "@components/layout/dashboard/main/DashboardError";

import DashboardSkeleton from "@components/ui/dashboard/skeletons/DashboardSkeleton";

import { useDashboard } from "@/hooks/dashboard/useDashboard";

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
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main column */}
            <div className="min-w-0 space-y-6">
              <DashboardOverview
                workspaceCount={dashboard.stats.workspaceCount}
                boardCount={dashboard.stats.boardCount}
                taskCount={dashboard.stats.activeTaskCount}
              />
              <WorkspaceSection workspaces={dashboard.workspaces} />
              <RecentBoardsSection boards={dashboard.recentBoards} />
            </div>

            {/* Right rail — activity, styled like the reference thread panel */}
            <aside
              aria-label="Recent activity"
              className="xl:sticky xl:top-20 xl:self-start"
            >
              <ActivitySection activities={dashboard.recentActivity} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
