import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A board we've grabbed from the API and kept, so the navbar can list
 *  boards instantly without a fresh request. */
export interface SavedBoard {
  id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
  updatedAt: string;
}

interface BoardsState {
  /** One flat list across every workspace we've seen. */
  boards: SavedBoard[];
  /** The board the user last opened / picked from the navbar. */
  lastBoardId: string | null;

  upsertBoards: (boards: SavedBoard[]) => void;
  setLastBoard: (boardId: string) => void;
  clearBoards: () => void;
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set) => ({
      boards: [],
      lastBoardId: null,

      upsertBoards: (incoming) =>
        set((state) => {
          if (incoming.length === 0) return {};
          const map = new Map(state.boards.map((board) => [board.id, board]));
          incoming.forEach((board) => map.set(board.id, board));
          return { boards: Array.from(map.values()) };
        }),

      setLastBoard: (boardId) => set({ lastBoardId: boardId }),

      clearBoards: () => set({ boards: [], lastBoardId: null }),
    }),
    { name: "kanban.boards" },
  ),
);
