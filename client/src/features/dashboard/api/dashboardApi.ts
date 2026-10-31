import { apiClient } from "@/services/client";

import type { ApiResponse } from "@/types/api";
import type { DashboardResponse } from "@/types/dashboard";

interface DashboardApiResponse {
  data: DashboardResponse;
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response =
    await apiClient.get<ApiResponse<DashboardApiResponse>>("/dashboard");

  return response.data.data.data;
};
