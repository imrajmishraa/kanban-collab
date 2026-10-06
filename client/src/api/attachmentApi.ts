import { apiClient } from "./client";

import type { ApiResponse } from "@/types/api/api";

export interface PresignPayload {
  cardId: string;
  fileName: string;
  fileType: string;
}

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export const attachmentApi = {
  async presign(payload: PresignPayload): Promise<PresignResponse> {
    const response = await apiClient.post<ApiResponse<PresignResponse>>(
      "/attachments/presign",
      payload,
    );

    return response.data.data;
  },

  async upload(presignedUrl: string, file: File): Promise<void> {
    await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  },
};
