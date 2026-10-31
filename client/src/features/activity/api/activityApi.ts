import { apiClient } from "@/services/client";

import type { ApiResponse } from "@/types/api";
import type { ActivityEntry, ActivityFeedPage } from "@/types/activity";

interface ListBoardActivityResponse {
  activity: ActivityEntry[];
}

export const activityApi = {
  /** The caller's feed, newest first, six rows a page by default. */
  async listMyActivity(
    params: { cursor?: string | null; limit?: number } = {},
  ): Promise<ActivityFeedPage> {
    const response = await apiClient.get<ApiResponse<ActivityFeedPage>>(
      "/activity",
      {
        params: {
          ...(params.cursor ? { cursor: params.cursor } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
        },
      },
    );

    return response.data.data;
  },

  async listBoardActivity(
    boardId: string,
    limit = 30,
  ): Promise<ActivityEntry[]> {
    const response = await apiClient.get<
      ApiResponse<ListBoardActivityResponse>
    >(`/boards/${boardId}/activity`, { params: { limit } });

    return response.data.data.activity;
  },
};
