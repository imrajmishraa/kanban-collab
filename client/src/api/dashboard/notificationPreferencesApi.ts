import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesPayload,
} from "@/types/api/dashboard/notificationPreferences";

export const notificationPreferencesApi = {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      "/notifications/preferences",
    );

    return response.data.data;
  },

  async updatePreferences(
    payload: UpdateNotificationPreferencesPayload,
  ): Promise<NotificationPreferences> {
    const response = await apiClient.patch<
      ApiResponse<NotificationPreferences>
    >("/notifications/preferences", payload);

    return response.data.data;
  },
};
