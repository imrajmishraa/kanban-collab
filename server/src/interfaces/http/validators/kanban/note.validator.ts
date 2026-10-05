import { z } from "zod";
import { objectIdSchema } from "../common/objectId";

export const noteParamsSchema = z.object({
  noteId: objectIdSchema,
});

export const listNotesQuerySchema = z.object({
  workspaceId: objectIdSchema,
  boardId: objectIdSchema.optional(),
});

export const createNoteSchema = {
  body: z.object({
    workspaceId: objectIdSchema,
    boardId: objectIdSchema.optional(),
    title: z.string().trim().min(1, "Title is required.").max(200),
    body: z.string().max(20000).optional(),
    isPinned: z.boolean().optional(),
  }),
};

export const updateNoteSchema = {
  params: noteParamsSchema,
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      body: z.string().max(20000).optional(),
      isPinned: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided for update.",
    }),
};
