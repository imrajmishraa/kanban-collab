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

const cursorSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid cursor.")
  .optional();

const limitSchema = z.coerce.number().int().min(1).max(50).default(10);

export const listCommentsSchema = {
  params: cardCommentParamsSchema,
  query: z.object({ cursor: cursorSchema, limit: limitSchema }).optional(),
};

export const createCommentSchema = {
  params: cardCommentParamsSchema,
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty.")
      .max(5000, "Comment cannot exceed 5000 characters."),
    /** Omit or null for a top-level comment. */
    parentId: objectIdSchema.nullish(),
  }),
};

export const listRepliesSchema = {
  params: commentParamsSchema,
  query: z.object({ cursor: cursorSchema, limit: limitSchema }).optional(),
};

export const updateCommentSchema = {
  params: commentParamsSchema,
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty.")
      .max(5000, "Comment cannot exceed 5000 characters."),
  }),
};

export const voteCommentSchema = {
  params: commentParamsSchema,
  body: z.object({
    action: z.union([z.literal(1), z.literal(-1)]),
  }),
};
