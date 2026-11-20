export type BoardVisibility = "private" | "public" | "workspace";

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  backgroundColor: string;
  coverImageUrl?: string;
  visibility: BoardVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardPayload {
  workspaceId: string;
  name: string;
  description?: string;
  backgroundColor?: string;
  visibility?: BoardVisibility;
}

export interface UpdateBoardPayload {
  name?: string;
  description?: string;
  backgroundColor?: string;
  coverImageUrl?: string;
  visibility?: BoardVisibility;
}

export interface BoardCardChecklistItem {
  title: string;
  isCompleted: boolean;
}

export interface BoardCard {
  id: string;
  columnId: string;
  boardId: string;
  workspaceId: string;
  title: string;
  description: string;
  orderIndex: number;
  dueDate?: string;
  members: string[];
  labels: string[];
  checklists: BoardCardChecklistItem[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  /** Optional note about what belongs in this column. */
  description?: string | null;
  boardId: string;
  workspaceId: string;
  name: string;
  orderIndex: number;
  cards: BoardCard[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetails extends Board {
  columns: BoardColumn[];
}

export interface ListBoardsParams {
  page?: number;
  limit?: number;
  visibility?: BoardVisibility;
  search?: string;
}

export interface BoardPagination {
  page: number;
  limit: number;
  totalBoards: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Shared (public) board ────────────────────────────────────

/** A card as seen by a reader who is not a workspace member. */
export interface SharedBoardCard {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  dueDate: string | null;
  labels: string[];
  checklistCount: number;
}

export interface SharedBoardColumn {
  id: string;
  name: string;
  orderIndex: number;
  cards: SharedBoardCard[];
}

/**
 * The read projection served by `GET /boards/:boardId/public`.
 *
 * Deliberately carries no members, user ids or settings — the endpoint is the
 * one kanban route that answers without a session.
 */
export interface SharedBoard {
  board: {
    id: string;
    name: string;
    description: string;
    visibility: string;
    workspaceName: string | null;
  };
  columns: SharedBoardColumn[];
}
