import { apiClient } from "@/api/client";

import type { ApiResponse } from "@/types/api/api";
import type { DashboardResponse } from "@/types/dashboard/dashboard";


interface DashboardApiResponse {
  data: DashboardResponse;
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response =
    await apiClient.get<ApiResponse<DashboardApiResponse>>("/dashboard");

  return response.data.data.data;
};
