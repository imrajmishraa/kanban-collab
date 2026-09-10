export interface BoardPagination {
  page: number;
  limit: number;
  totalBoards: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}