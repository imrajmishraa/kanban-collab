import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { attachmentsApi } from "@/api/dashboard/attachmentsApi";

export const attachmentKeys = {
  all: ["attachments"] as const,
  forCard: (cardId: string) => [...attachmentKeys.all, "card", cardId] as const,
};

export function useCardAttachments(cardId: string | undefined) {
  return useQuery({
    queryKey: cardId ? attachmentKeys.forCard(cardId) : attachmentKeys.all,
    queryFn: () => attachmentsApi.listAttachments(cardId!),
    enabled: Boolean(cardId),
  });
}

/** Auth → upload to ImageKit → record the URL against the card (T15). */
export function useUploadAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const auth = await attachmentsApi.getImageKitAuth();
      const uploaded = await attachmentsApi.uploadToImageKit(file, auth);
      return attachmentsApi.addAttachment(cardId, uploaded);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attachmentKeys.forCard(cardId),
      });
    },
  });
}

export function useDeleteAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentsApi.removeAttachment(cardId, attachmentId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attachmentKeys.forCard(cardId),
      });
    },
  });
}
