import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PinnedBoardsState {
  ids: string[];
  toggle: (boardId: string) => void;
  isPinned: (boardId: string) => boolean;
}

/**
 * Starred (pinned) boards.
 *
 * Same storage key the sidebar has always used, so existing pins survive.
 * The sidebar still keeps its own copy in local state, which means a pin made
 * here shows up there on the next mount rather than instantly.
 */
export const usePinnedBoards = create<PinnedBoardsState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (boardId) =>
        set((state) => ({
          ids: state.ids.includes(boardId)
            ? state.ids.filter((id) => id !== boardId)
            : [...state.ids, boardId],
        })),
      isPinned: (boardId) => get().ids.includes(boardId),
    }),
    { name: "kanban.pinnedBoards" },
  ),
);
