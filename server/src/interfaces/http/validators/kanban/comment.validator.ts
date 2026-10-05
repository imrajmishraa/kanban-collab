import { z } from "zod";
import { objectIdSchema } from "../common/objectId";

/** `req.params` for routes keyed by a card (`/cards/:cardId/comments`). */
export const cardCommentParamsSchema = z.object({
  cardId: objectIdSchema,
});

/** `req.params` for routes keyed by a comment (`/comments/:commentId`). */
export const commentParamsSchema = z.object({
  commentId: objectIdSchema,
});

export const listCommentsSchema = {
  params: cardCommentParamsSchema,
};

export const createCommentSchema = {
  params: cardCommentParamsSchema,
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty.")
      .max(5000, "Comment cannot exceed 5000 characters."),
  }),
};
