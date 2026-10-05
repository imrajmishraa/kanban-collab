import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  AddAttachmentPayload,
  CardAttachment,
  ImageKitAuth,
} from "@/types/api/dashboard/attachment";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

interface ImageKitUploadResponse {
  url: string;
  name?: string;
  fileType?: string;
  size?: number;
}

export const attachmentsApi = {
  /** Short-lived ImageKit credentials (T15). */
  async getImageKitAuth(): Promise<ImageKitAuth> {
    const response = await apiClient.get<ApiResponse<ImageKitAuth>>(
      "/attachments/imagekit-auth",
    );

    return response.data.data;
  },

  async listAttachments(cardId: string): Promise<CardAttachment[]> {
    const response = await apiClient.get<
      ApiResponse<{ attachments: CardAttachment[] }>
    >(`/cards/${cardId}/attachments`);

    return response.data.data.attachments;
  },

  async addAttachment(
    cardId: string,
    payload: AddAttachmentPayload,
  ): Promise<CardAttachment> {
    const response = await apiClient.post<
      ApiResponse<{ attachment: CardAttachment }>
    >(`/cards/${cardId}/attachments`, payload);

    return response.data.data.attachment;
  },

  async removeAttachment(
    cardId: string,
    attachmentId: string,
  ): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ attachment: { id: string } }>
    >(`/cards/${cardId}/attachments/${attachmentId}`);

    return response.data.data.attachment;
  },

  /**
   * Upload a file straight to ImageKit using the signed credentials.
   *
   * The bytes never touch our server — ImageKit's upload API is called
   * directly from the browser with the token/signature we were issued.
   */
  async uploadToImageKit(
    file: File,
    auth: ImageKitAuth,
  ): Promise<AddAttachmentPayload> {
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);
    form.append("publicKey", auth.publicKey);
    form.append("signature", auth.signature);
    form.append("expire", String(auth.expire));
    form.append("token", auth.token);

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error("ImageKit upload failed.");
    }

    const data = (await response.json()) as ImageKitUploadResponse;

    return {
      url: data.url,
      name: data.name ?? file.name,
      fileType: data.fileType ?? file.type,
      size: data.size ?? file.size,
    };
  },
};
