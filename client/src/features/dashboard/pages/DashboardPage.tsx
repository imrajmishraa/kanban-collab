import DashboardHeader from "#components/layout/dashboard/main/DashboardHeader";
import DashboardOverview from "#components/layout/dashboard/main/DashboardOverview";
import ActivitySection from "#components/layout/dashboard/main/ActivitySection";
import RecentBoardsSection from "#components/layout/dashboard/main/RecentBoardsSection";
import WorkspaceSection from "#components/layout/dashboard/main/WorkspaceSection";

import { useDashboard } from "@/hooks/dashboard/useDashboard";

export default function DashboardPage() {
  const { data: dashboard, isLoading, isError } = useDashboard();

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <DashboardHeader />

        {isLoading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="font-mono text-sm text-neutral-500">Loading...</p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="font-mono text-sm text-red-400">
              Unable to load dashboard data.
            </p>
          </div>
        )}

        {!isLoading && !isError && dashboard && (
          <>
            <DashboardOverview
              workspaceCount={dashboard.stats.workspaceCount}
              boardCount={dashboard.stats.boardCount}
              taskCount={dashboard.stats.activeTaskCount}
            />

            <WorkspaceSection workspaces={dashboard.workspaces} />

            <ActivitySection activities={dashboard.recentActivity} />

            <RecentBoardsSection boards={dashboard.recentBoards} />
          </>
        )}
      </div>
    </div>
  );
}
