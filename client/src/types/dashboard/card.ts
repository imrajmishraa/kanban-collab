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
  checklists: unknown[];
  labels: unknown[];
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
  checklists: unknown[];
  labels: unknown[];
}


export interface MoveCardRequest {
  targetColumnId: string;
  targetOrderIndex: number;
}

