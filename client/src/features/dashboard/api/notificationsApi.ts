import { apiClient } from "@/services/client";

import type { ApiResponse } from "@/types/api";
import type {
  NotificationType,
  NotificationsResponse,
} from "@/types/notification";

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

  /** Remove a single notification from the feed. */
  async clear(notificationId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/notifications/${notificationId}`,
    );

    return response.data.data;
  },

  /** Clear the whole feed, or only what has been read. */
  async clearAll(options?: {
    readOnly?: boolean;
  }): Promise<{ deleted: number }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: number }>>(
      "/notifications",
      { params: options?.readOnly ? { read: "true" } : undefined },
    );

    return response.data.data;
  },

  /**
   * Mute one notification type by turning off its in-app channel.
   * The server already stores per-type channel preferences, so this is the
   * same endpoint the preferences screen uses.
   */
  async muteType(type: NotificationType): Promise<{ id: string }> {
    const response = await apiClient.patch<ApiResponse<{ id: string }>>(
      "/notifications/preferences",
      { preferences: { [type]: { inApp: false } } },
    );

    return response.data.data;
  },
};
