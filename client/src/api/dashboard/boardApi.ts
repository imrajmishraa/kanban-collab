import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  Board,
  BoardColumn,
  BoardDetails,
  CreateBoardPayload,
  UpdateBoardPayload,
  ListBoardsParams,
  BoardPagination,
} from "@/types/api/dashboard/board";

interface BoardApiDocument extends Omit<Board, "id"> {
  _id: string;
}

interface BoardWithColumnsApiDocument extends BoardApiDocument {
  columns: BoardColumn[];
}

interface CreateOrUpdateBoardResponse {
  data: BoardApiDocument;
}

interface ListBoardsApiResponse {
  boards: BoardApiDocument[];
  pagination: BoardPagination;
}

interface ListBoardsWithColumnsApiResponse {
  boards: BoardWithColumnsApiDocument[];
  pagination: BoardPagination;
}

/** A board plus its nested columns — the heavy overview payload. */
export interface BoardWithColumns extends Board {
  columns: BoardColumn[];
}

const normalizeBoard = (board: BoardApiDocument): Board => ({
  ...board,
  id: board._id,
});

const normalizeBoardWithColumns = (
  board: BoardWithColumnsApiDocument,
): BoardWithColumns => ({
  ...board,
  id: board._id,
  columns: board.columns ?? [],
});

export const boardApi = {
  async createBoard(payload: CreateBoardPayload): Promise<Board> {
    const response = await apiClient.post<
      ApiResponse<CreateOrUpdateBoardResponse>
    >("/boards", payload);

    return normalizeBoard(response.data.data.data);
  },

  async listBoards(
    workspaceId: string,
    params?: ListBoardsParams,
  ): Promise<{
    boards: Board[];
    pagination: BoardPagination;
  }> {
    const response = await apiClient.get<ApiResponse<ListBoardsApiResponse>>(
      "/boards",
      {
        params: {
          ...params,
          workspaceId,
        },
      },
    );

    const { boards, pagination } = response.data.data;

    return {
      boards: boards.map(normalizeBoard),
      pagination,
    };
  },

  /**
   * Opt-in heavy list for the boards overview: one request returns every
   * board *with* its columns and cards nested, instead of one request per
   * board (the old N+1).
   */
  async listBoardsWithColumns(
    workspaceId: string,
    params?: ListBoardsParams,
  ): Promise<{
    boards: BoardWithColumns[];
    pagination: BoardPagination;
  }> {
    const response = await apiClient.get<
      ApiResponse<ListBoardsWithColumnsApiResponse>
    >("/boards", {
      params: {
        ...params,
        workspaceId,
        include: "columns,cards",
      },
    });

    const { boards, pagination } = response.data.data;

    return {
      boards: boards.map(normalizeBoardWithColumns),
      pagination,
    };
  },

  async updateBoard(
    boardId: string,
    payload: UpdateBoardPayload,
  ): Promise<Board> {
    const response = await apiClient.patch<
      ApiResponse<CreateOrUpdateBoardResponse>
    >(`/boards/${boardId}`, payload);

    return normalizeBoard(response.data.data.data);
  },

  async getBoardDetails(boardId: string): Promise<BoardDetails> {
    const response = await apiClient.get<ApiResponse<{ data: BoardDetails }>>(
      `/boards/${boardId}`,
    );

    return response.data.data.data;
  },

  async deleteBoard(boardId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ data: { id: string } }>
    >(`/boards/${boardId}`);

    return response.data.data.data;
  },

  async createColumn(payload: {
    boardId: string;
    name: string;
    orderIndex: number;
  }): Promise<BoardColumn> {
    const response = await apiClient.post<ApiResponse<{ data: BoardColumn }>>(
      "/columns",
      payload,
    );

    return response.data.data.data;
  },

  async updateColumn(
    columnId: string,
    payload: { name?: string; orderIndex?: number },
  ): Promise<BoardColumn> {
    const response = await apiClient.patch<ApiResponse<{ data: BoardColumn }>>(
      `/columns/${columnId}`,
      payload,
    );

    return response.data.data.data;
  },

  async deleteColumn(columnId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ data: { id: string } }>
    >(`/columns/${columnId}`);

    return response.data.data.data;
  },

  async createCard(payload: {
    columnId: string;
    boardId: string;
    title: string;
    orderIndex?: number;
  }): Promise<{ id: string }> {
    const response = await apiClient.post<
      ApiResponse<{ data: { id: string } }>
    >("/cards", payload);

    return response.data.data.data;
  },

  async updateCard(
    cardId: string,
    payload: Partial<{
      title: string;
      description: string;
      dueDate: string | null;
      members: string[];
      labels: string[];
      isArchived: boolean;
    }>,
  ): Promise<{ id: string }> {
    const response = await apiClient.patch<
      ApiResponse<{ data: { id: string } }>
    >(`/cards/${cardId}`, payload);

    return response.data.data.data;
  },

  async moveCard(
    cardId: string,
    payload: { targetColumnId: string; targetOrderIndex: number },
  ): Promise<null> {
    const response = await apiClient.patch<ApiResponse<{ data: null }>>(
      `/cards/${cardId}/move`,
      payload,
    );

    return response.data.data.data;
  },

  async deleteCard(cardId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ data: { id: string } }>
    >(`/cards/${cardId}`);

    return response.data.data.data;
  },
};
