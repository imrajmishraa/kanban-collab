import type { BoardDetails } from "@/types/api/dashboard/board";

import BoardHeader from "@components/layout/board/BoardHeader";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import BoardColumns from "@components/layout/board/BoardColumns";

interface BoardViewProps {
  board: BoardDetails;
}

export default function BoardView({ board }: BoardViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#080808]">
      <BoardHeader board={board} />

      <BoardToolbar boardId={board.id} />

      <main className="min-h-0 flex-1 overflow-hidden">
        <BoardColumns board={board} />
      </main>
    </div>
  );
}
