import { useMemo, useState } from "react";

import type { BoardDetails } from "@/types/api/dashboard/board";

import BoardHeader from "@components/layout/board/BoardHeader";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import BoardColumns from "@components/layout/board/BoardColumns";
import BoardSearchEmptyState from "@components/ui/board/BoardSearchEmptyState";
import CreateCardModal, {
  type CreateCardFormData,
} from "@components/ui/board/card/CreateCardModal";

interface BoardViewProps {
  board: BoardDetails;
}

export default function BoardView({ board }: BoardViewProps) {
  const [search, setSearch] = useState("");
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [createCardColumnId, setCreateCardColumnId] = useState<
    string | undefined
  >();

  const filteredBoard = useMemo<BoardDetails>(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return board;
    }

    return {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) =>
          card.title.toLowerCase().includes(query),
        ),
      })),
    };
  }, [board, search]);

  const hasSearch = search.trim().length > 0;

  const hasSearchResults = filteredBoard.columns.some(
    (column) => column.cards.length > 0,
  );

  const openCreateCard = (columnId?: string) => {
    setCreateCardColumnId(columnId);
    setCreateCardOpen(true);
  };

  const closeCreateCard = () => {
    setCreateCardOpen(false);
    setCreateCardColumnId(undefined);
  };

  const handleCreateCard = (data: CreateCardFormData) => {
    /*
     * API integration comes next.
     *
     * Backend contract:
     * {
     *   boardId,
     *   columnId,
     *   title,
     *   orderIndex
     * }
     */
    console.log("Create card:", {
      boardId: board.id,
      columnId: data.columnId,
      title: data.title,
      orderIndex: 0,
    });

    closeCreateCard();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#080808]">
      <BoardHeader board={board} />

      <BoardToolbar
        boardId={board.id}
        onSearch={setSearch}
        onAddCard={() => openCreateCard()}
      />

      <main className="min-h-0 flex-1 overflow-hidden">
        {hasSearch && !hasSearchResults ? (
          <BoardSearchEmptyState
            query={search.trim()}
            onClear={() => setSearch("")}
          />
        ) : (
          <BoardColumns board={filteredBoard} onAddCard={openCreateCard} />
        )}
      </main>

      <CreateCardModal
        open={createCardOpen}
        columnId={createCardColumnId}
        onClose={closeCreateCard}
        onSubmit={handleCreateCard}
      />
    </div>
  );
}
