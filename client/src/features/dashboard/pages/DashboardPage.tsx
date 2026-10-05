import DashboardBoardEmbed from "@components/layout/dashboard/main/DashboardBoardEmbed";
import DashboardHeader from "@components/layout/dashboard/main/DashboardHeader";
import DashboardOverview from "@components/layout/dashboard/main/DashboardOverview";
import ActivitySection from "@components/layout/dashboard/main/ActivitySection";
import RecentBoardsSection from "@components/layout/dashboard/main/RecentBoardsSection";
import WorkspaceSection from "@components/layout/dashboard/main/WorkspaceSection";

import DashboardError from "@components/layout/dashboard/main/DashboardError";
import DashboardSkeleton from "@components/ui/dashboard/skeletons/DashboardSkeleton";

import { useBoards, useBoardDetails } from "@/hooks/dashboard/useBoards";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { useBoardsStore } from "@/stores/boards";

export default function DashboardPage() {
  const {
    data: dashboard,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useDashboard();

  // Featured board: the one the user last opened (from the navbar), else the
  // first board in the active workspace.
  const lastBoardId = useBoardsStore((s) => s.lastBoardId);
  const { data: boardsData } = useBoards();
  const workspaceBoards =
    boardsData?.pages.flatMap((page) => page.boards) ?? [];
  const featuredBoardId = lastBoardId ?? workspaceBoards[0]?.id ?? null;

  const { data: featuredBoard, isLoading: isBoardLoading } = useBoardDetails(
    featuredBoardId ?? undefined,
  );

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

            {/* ── Workspaces / boards + activity ── */}
            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-6">
                <WorkspaceSection workspaces={dashboard.workspaces} />
                <RecentBoardsSection boards={dashboard.recentBoards} />
              </div>

              <aside
                aria-label="Recent activity"
                className="xl:sticky xl:top-20 xl:self-start"
              >
                <ActivitySection activities={dashboard.recentActivity} />
              </aside>
            </div>

            {/* ── Featured board (embedded kanban) ── */}
            <section className="mt-8">
              <div className="mb-3 flex items-end justify-between px-1">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                    {lastBoardId ? "Last opened board" : "Your board"}
                  </p>
                </div>
              </div>

              {isBoardLoading && !featuredBoard ? (
                <div className="h-135 animate-pulse rounded-xl border border-white/8 bg-white/4" />
              ) : featuredBoard && featuredBoardId ? (
                <DashboardBoardEmbed
                  board={featuredBoard}
                  boardId={featuredBoardId}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-14 text-center">
                  <p className="font-mono text-[12px] text-(--text-muted)">
                    No board to show yet — create one and it&apos;ll appear
                    here.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
