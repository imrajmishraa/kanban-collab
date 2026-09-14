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

export interface ListBoardsResponse {
  boards: Board[];
  pagination: BoardPagination;
}
