import type { BoardColumn } from "@/types/api/dashboard/board";
import { assertValid } from "./boardApi";
import type { ApiResponse } from "@/types/api/api";
import { apiClient } from "../client";
import {
  createColumnSchema,
  updateColumnSchema,
} from "@/validations/dashboard/column.validator";

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

export const columnApi = {
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
};
