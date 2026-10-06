import type {
  CreateCardRequest,
  CreateCardResponse,
  MoveCardRequest,
  UpdateCardRequest,
  UpdateCardResponse,
} from "@/types/api/dashboard/card";

import { apiClient } from "../client";
import type { ApiResponse } from "@/types/api/api";

export const cardApi = {
  createCard: async (data: CreateCardRequest): Promise<CreateCardResponse> => {
    const response = await apiClient.post("/cards", data);

    return response.data.data;
  },

  moveCard: async (cardId: string, data: MoveCardRequest): Promise<null> => {
    const response = await apiClient.patch(`/cards/${cardId}/move`, data);

    return response.data.data;
  },

  updateCard: async (
    cardId: string,
    data: UpdateCardRequest,
  ): Promise<UpdateCardResponse> => {
    const response = await apiClient.patch(`/cards/${cardId}`, data);

    return response.data.data;
  },

  async deleteCard(cardId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ data: { id: string } }>
    >(`/cards/${cardId}`);

    return response.data.data.data;
  },
};
