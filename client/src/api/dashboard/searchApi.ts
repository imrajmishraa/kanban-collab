import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type { SearchResultCard } from "@/types/api/dashboard/search";

/**
 * Server-side card search (T16). `GET /cards/search` existed but nothing on the
 * client called it — this is that missing wiring.
 */
export const searchApi = {
  async searchCards(
    boardId: string,
    query: string,
  ): Promise<SearchResultCard[]> {
    const response = await apiClient.get<
      ApiResponse<{ data: { cards: SearchResultCard[] } }>
    >("/cards/search", { params: { boardId, q: query } });

    return response.data.data.data.cards;
  },
};
