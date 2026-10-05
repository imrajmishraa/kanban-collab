import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type { ActivityEntry } from "@/types/api/dashboard/activity";

interface ListBoardActivityResponse {
  activity: ActivityEntry[];
}

export const activityApi = {
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
