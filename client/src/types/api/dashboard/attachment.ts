export interface CardAttachment {
  id: string;
  url: string;
  name: string;
  fileType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

/** Short-lived credentials for a direct browser → ImageKit upload. */
export interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string | null;
}

export interface AddAttachmentPayload {
  url: string;
  name: string;
  fileType: string;
  size?: number;
}
