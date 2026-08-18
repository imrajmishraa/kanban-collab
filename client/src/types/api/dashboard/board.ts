export type BoardVisibility = "workspace" | "private";

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

export interface BoardCard {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  dueDate?: string;
  labels: unknown[];
  checkLists: unknown[];
}

export interface BoardColumn {
  id: string;
  name: string;
  orderIndex: number;
  cards: BoardCard[];
}

export interface BoardDetails {
  id: string;
  name: string;
  description?: string;
  backgroundColor: string;
  columns: BoardColumn[];
}
