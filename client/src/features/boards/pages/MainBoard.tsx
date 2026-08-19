import { useParams } from "react-router-dom";

import BoardError from "@components/ui/board/BoardError";
import BoardSkeleton from "@components/ui/board/BoardSkeleton";

import BoardView from "../components/BoardView";
import { useBoardDetails } from "@/hooks/dashboard/useBoards";

export default function MainBoard() {
  const { boardId } = useParams<{ boardId: string }>();

  const {
    data: board,
    isLoading,
    isError,
    error,
    refetch,
  } = useBoardDetails(boardId);

  if (!boardId) {
    return (
      <div className="flex h-full items-center justify-center bg-[#080808]">
        <p className="font-mono text-xs text-neutral-500">BOARD_ID_MISSING</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-0">
        <BoardSkeleton />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="h-full min-h-0">
        <BoardError
          message={
            error instanceof Error
              ? error.message
              : "Unable to load the requested board."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <BoardView board={board} />
    </div>
  );
}
