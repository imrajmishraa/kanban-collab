import { z } from "zod";
import { objectIdSchema } from "../common/objectId";

/** `req.params` for card-scoped attachment routes. */
export const cardOnlyParamsSchema = z.object({
  cardId: objectIdSchema,
});

/** `req.params` for a single attachment. */
export const cardAttachmentParamsSchema = z.object({
  cardId: objectIdSchema,
  attachmentId: objectIdSchema,
});

export const addAttachmentSchema = {
  params: cardOnlyParamsSchema,
  body: z.object({
    url: z.string().trim().url("Attachment URL must be a valid URL."),
    name: z.string().trim().min(1, "File name is required.").max(255),
    fileType: z.string().trim().min(1, "File type is required.").max(120),
    size: z.number().int().nonnegative().optional(),
  }),
};
