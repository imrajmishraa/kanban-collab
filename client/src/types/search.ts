export interface SearchResultCard {
  id: string;
  title: string;
  columnId: string;
}

export interface SearchCardsParams {
  boardId: string;
  query: string;
}
