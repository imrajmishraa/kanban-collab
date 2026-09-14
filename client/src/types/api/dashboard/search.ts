export interface SearchCardsParams {
  boardId: string;
  q: string;
  limit?: number;
}

export interface SearchResultCard {
  id: string;
  title: string;
  description: string;
  columnId: string;
  boardId: string;
}
