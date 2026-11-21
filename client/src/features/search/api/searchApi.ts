import { apiClient } from "@/services/client";

import type { ApiResponse } from "@/types/api";
import type { SearchCardsParams, SearchCardsResponse } from "@/types/search";

export const searchApi = {
  async searchCards(params: SearchCardsParams): Promise<SearchCardsResponse> {
    const response = await apiClient.get<ApiResponse<SearchCardsResponse>>(
      "/cards/search",
      { params },
    );

    return response.data.data;
  },
};
