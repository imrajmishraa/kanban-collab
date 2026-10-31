import { apiClient } from "@/services/client";

import type { ApiResponse } from "@/types/api";
import type { SearchCardsParams, SearchResultCard } from "@/types/search";

interface SearchResponse {
  results: SearchResultCard[];
  total: number;
}

export const searchApi = {
  async searchCards(
    params: SearchCardsParams,
  ): Promise<{ results: SearchResultCard[]; total: number }> {
    const response = await apiClient.get<ApiResponse<SearchResponse>>(
      "/cards/search",
      { params },
    );

    return response.data.data;
  },
};
