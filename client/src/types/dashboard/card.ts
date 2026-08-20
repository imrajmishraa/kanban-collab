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
