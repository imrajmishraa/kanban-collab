import type {
  ArchivedCard,
  CreateCardRequest,
  CreateCardResponse,
  MoveCardRequest,
  UpdateCardRequest,
  UpdateCardResponse,
} from "@/types/card";

import { apiClient } from "@/services/client";
import type { ApiResponse } from "@/types/api";

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

  /** Archived cards for a board — the only way back from an archive. */
  async listArchivedCards(boardId: string): Promise<ArchivedCard[]> {
    const response = await apiClient.get<
      ApiResponse<{ cards: ArchivedCard[] }>
    >(`/boards/${boardId}/archived-cards`);

    return response.data.data.cards;
  },

  async deleteCard(cardId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ data: { id: string } }>
    >(`/cards/${cardId}`);

    return response.data.data.data;
  },
};
