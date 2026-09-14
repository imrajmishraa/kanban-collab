export interface CardChecklistItem {
  title: string;
  isCompleted: boolean;
}

export interface CreateCardRequest {
  boardId: string;
  columnId: string;
  title: string;
  orderIndex?: number;
}

export interface CreateCardResponse {
  id: string;
  title: string;
  columnId: string;
  orderIndex: number;
  checklists: CardChecklistItem[];
  labels: string[];
}

export interface UpdateCardRequest {
  title?: string;
  columnId?: string;
}

export interface UpdateCardResponse {
  id: string;
  title: string;
  columnId: string;
  orderIndex: number;
  checklists: CardChecklistItem[];
  labels: string[];
}

export interface MoveCardRequest {
  toColumnId: string; // ← align with server schema
  toIndex: number; // ← align with server schema
}
