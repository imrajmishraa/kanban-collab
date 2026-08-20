import type { CreateCardRequest } from "@/types/dashboard/card";


export const cardApi = {
  createCard: async ({
    boardId,
    columnId,
    title,
  }: CreateCardRequest) => {
    // Connect this to the project's existing HTTP client.
    // The exact endpoint/client call should follow boardApi.ts.
    throw new Error("cardApi.createCard is not implemented yet");
  },
};
