import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationPreferencesApi } from "@/features/settings/api/notificationPreferencesApi";

import type { UpdateNotificationPreferencesPayload } from "@/types/notificationPreferences";

export const notificationPreferenceKeys = {
  all: ["notification-preferences"] as const,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationPreferenceKeys.all,
    queryFn: () => notificationPreferencesApi.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
      notificationPreferencesApi.updatePreferences(payload),

    // The PATCH returns the full, merged preferences — write it straight into
    // the cache so the UI reflects the save without a refetch.
    onSuccess: (data) => {
      queryClient.setQueryData(notificationPreferenceKeys.all, data);
    },
  });
}
