import { apiClient } from "../client";
import type { ApiResponse } from "@/types/api/api";
import type {
  Board,
  BoardDetails,
  CreateBoardPayload,
  UpdateBoardPayload,
  ListBoardsParams,
  BoardPagination,
} from "@/types/api/dashboard/board";

interface BoardApiDocument extends Omit<Board, "id"> {
  _id: string;
}

interface CreateOrUpdateBoardResponse {
  data: BoardApiDocument;
}

interface ListBoardsApiResponse {
  boards: BoardApiDocument[];
  pagination: BoardPagination;
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
          workspaceId,
          ...params,
        },
      },
    );

    const { boards, pagination } = response.data.data;

    return {
      boards: boards.map(normalizeBoard),
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
    const response = await apiClient.get<
      ApiResponse<{
        data: BoardDetails;
      }>
    >(`/boards/${boardId}`);

    return response.data.data.data;
  },
};