import { useState } from "react";
import type { BoardCard as BoardCardType } from "@/types/api/dashboard/board";
import type { BoardDetails } from "@/types/api/dashboard/board";

import BoardHeader from "@components/layout/board/BoardHeader";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import BoardColumns from "@components/layout/board/BoardColumns";
import CardDetailsModal from "@components/ui/board/card/CardDetailsModal";

interface BoardViewProps {
  board: BoardDetails;
}

export default function BoardView({ board }: BoardViewProps) {
  const [selectedCard, setSelectedCard] = useState<BoardCardType | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#080808]">
      <BoardHeader board={board} />

      <BoardToolbar boardId={board.id} />

      <main className="min-h-0 flex-1 overflow-hidden">
        <BoardColumns board={board} onCardClick={setSelectedCard} />
      </main>

      {selectedCard && (
        <CardDetailsModal
          card={selectedCard}
          boardId={board.id}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
