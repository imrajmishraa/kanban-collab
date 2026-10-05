import { useEffect } from "react";
import { useParams } from "react-router-dom";

import BoardError from "@components/ui/board/BoardError";
import BoardSkeleton from "@components/ui/board/BoardSkeleton";

import BoardView from "../components/BoardView";
import { BoardMessage, BoardShell } from "../components/BoardStates";
import { useBoardForPage } from "../hooks/useBoardForPage";
import { useBoardsStore } from "@/stores/boards";

export default function MainBoard() {
  const { boardId } = useParams<{ boardId: string }>();
  const { board, isLoading, isError, refetch } = useBoardForPage(boardId);
  const setLastBoard = useBoardsStore((s) => s.setLastBoard);

  // Remember this board so the dashboard can feature it.
  useEffect(() => {
    if (board) setLastBoard(board.id);
  }, [board, setLastBoard]);

  if (!boardId) {
    return (
      <BoardMessage
        title="No board selected"
        body="Pick a board from the sidebar to open it."
      />
    );
  }

  if (isLoading) {
    return (
      <BoardShell>
        <BoardSkeleton />
      </BoardShell>
    );
  }

  if (isError || !board) {
    return (
      <BoardShell>
        <BoardError
          message="We couldn't load this board. It may have been removed, or you may not have access."
          onRetry={() => void refetch()}
        />
      </BoardShell>
    );
  }

  return <BoardView board={board} boardId={boardId} />;
}
