export interface CreateColumnRequest {
  boardId: string;
  name: string;
  orderIndex?: number;
}

export interface CreateColumnResponse {
  id: string;
  boardId: string;
  name: string;
  orderIndex: number;
}
