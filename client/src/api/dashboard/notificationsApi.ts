import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type { NotificationsResponse } from "@/types/api/dashboard/notification";

export const notificationsApi = {
  async listNotifications(): Promise<NotificationsResponse> {
    const response =
      await apiClient.get<ApiResponse<NotificationsResponse>>("/notifications");

    return response.data.data;
  },

  async markRead(notificationId: string): Promise<{ id: string }> {
    const response = await apiClient.patch<
      ApiResponse<{ id: string; isRead: boolean }>
    >(`/notifications/${notificationId}/read`);

    return response.data.data;
  },

  async markAllRead(): Promise<{ modified: number }> {
    const response = await apiClient.patch<ApiResponse<{ modified: number }>>(
      "/notifications/read-all",
    );

    return response.data.data;
  },
};
