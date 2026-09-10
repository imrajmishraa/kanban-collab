import type {
  CreateCardRequest,
  CreateCardResponse,
  MoveCardRequest,
  UpdateCardRequest,
  UpdateCardResponse,
} from "@/types/dashboard/card";

import { apiClient } from "./client";


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
};
