import { apiClient, ApiClientError } from "../client";
import type { z } from "zod";

import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
} from "@/validations/dashboard/board.validator";

import type { ApiResponse } from "@/types/api/api";
import type {
  Board,
  BoardCardChecklistItem,
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

/**
 * The card shape returned by `POST /cards` (the server echoes the created
 * document back, minus the server-managed timestamps/`isArchived`).
 */
export interface CreatedCard {
  id: string;
  title: string;
  description: string;
  columnId: string;
  boardId: string;
  workspaceId: string;
  dueDate?: string | null;
  members: string[];
  orderIndex: number;
  checklists: BoardCardChecklistItem[];
  labels: string[];
}

/**
 * Validate a request payload before it hits the network.
 *
 * Throws an `ApiClientError` shaped exactly like the server's 422 response
 * (`code: "VALIDATION_FAILED"`, `errors: [{ field, message, code }]`), so the
 * existing error handling in the UI treats local and server rejections the
 * same way.
 */
function assertValid<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  label: string,
): z.infer<Schema> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiClientError({
      message: `Invalid ${label} details.`,
      statusCode: 422,
      code: "VALIDATION_FAILED",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || undefined,
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  return result.data;
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
    const body = assertValid(createBoardSchema, payload, "board");

    const response = await apiClient.post<
      ApiResponse<CreateOrUpdateBoardResponse>
    >("/boards", body);

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
    const body = assertValid(updateBoardSchema, payload, "board");

    const response = await apiClient.patch<
      ApiResponse<CreateOrUpdateBoardResponse>
    >(`/boards/${boardId}`, body);

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
    const body = assertValid(createColumnSchema, payload, "column");

    const response = await apiClient.post<ApiResponse<{ data: BoardColumn }>>(
      "/columns",
      body,
    );

    return response.data.data.data;
  },

  async updateColumn(
    columnId: string,
    payload: { name?: string; orderIndex?: number },
  ): Promise<BoardColumn> {
    const body = assertValid(updateColumnSchema, payload, "column");

    const response = await apiClient.patch<ApiResponse<{ data: BoardColumn }>>(
      `/columns/${columnId}`,
      body,
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
    description?: string;
    dueDate?: string;
    members?: string[];
    labels?: string[];
    orderIndex?: number;
  }): Promise<CreatedCard> {
    const body = assertValid(createCardSchema, payload, "card");

    const response = await apiClient.post<ApiResponse<{ data: CreatedCard }>>(
      "/cards",
      body,
    );

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
    const body = assertValid(updateCardSchema, payload, "card");

    const response = await apiClient.patch<
      ApiResponse<{ data: { id: string } }>
    >(`/cards/${cardId}`, body);

    return response.data.data.data;
  },

  async moveCard(
    cardId: string,
    payload: { targetColumnId: string; targetOrderIndex: number },
  ): Promise<null> {
    const body = assertValid(moveCardSchema, payload, "card");

    const response = await apiClient.patch<ApiResponse<{ data: null }>>(
      `/cards/${cardId}/move`,
      body,
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
