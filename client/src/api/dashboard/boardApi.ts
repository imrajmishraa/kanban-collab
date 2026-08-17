import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  Board,
  BoardDetails,
  CreateBoardPayload,
  UpdateBoardPayload,
} from "@/types/api/dashboard/board";

interface BoardApiDocument extends Omit<Board, "id"> {
  _id: string;
}

interface CreateOrUpdateBoardResponse {
  data: BoardApiDocument;
}

interface ListBoardsResponse {
  data: {
    boards: BoardApiDocument[];
  };
}

const normalizeBoard = (board: BoardApiDocument): Board => ({
  ...board,
  id: board._id,
});

export const boardApi = {
  async createBoard(payload: CreateBoardPayload): Promise<Board> {
    const response = await apiClient.post<
      ApiResponse<CreateOrUpdateBoardResponse>
    >("/boards", payload);

    return normalizeBoard(response.data.data.data);
  },

  async listBoards(workspaceId: string): Promise<Board[]> {
    const response = await apiClient.get<ApiResponse<ListBoardsResponse>>(
      "/boards",
      {
        params: {
          workspaceId,
        },
      },
    );

    return response.data.data.data.boards.map(normalizeBoard);
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
    const response = await apiClient.get<
      ApiResponse<{
        data: BoardDetails;
      }>
    >(`/boards/${boardId}`);

    return response.data.data.data;
  },
};
