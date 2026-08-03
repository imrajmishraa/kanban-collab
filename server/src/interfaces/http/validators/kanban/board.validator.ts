import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId.");

const boardVisibility = ["private", "public", "workspace"] as const;

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const boardParamsSchema = z.object({
  params: z.object({
    boardId: objectIdSchema,
  }),
});

const createBoardBodySchema = z.object({
  workspaceId: objectIdSchema,

  name: z
    .string()
    .trim()
    .min(3, "Board name must be at least 3 characters.")
    .max(100, "Board name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  backgroundColor: z
    .string()
    .regex(hexColorRegex, "Invalid background color.")
    .optional(),

  coverImageUrl: z.string().trim().url("Invalid cover image URL.").optional(),

  visibility: z.enum(boardVisibility).optional(),
});

export const createBoardSchema = z.object({
  body: createBoardBodySchema,
});

const updateBoardBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Board name must be at least 3 characters.")
      .max(100, "Board name cannot exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    backgroundColor: z
      .string()
      .regex(hexColorRegex, "Invalid background color.")
      .optional(),

    coverImageUrl: z.string().trim().url("Invalid cover image URL.").optional(),

    visibility: z.enum(boardVisibility).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export const updateBoardSchema = z.object({
  params: boardParamsSchema.shape.params,
  body: updateBoardBodySchema,
});

export const boardQuerySchema = z.object({
  query: z.object({
    workspaceId: objectIdSchema,

    visibility: z.enum(boardVisibility).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().max(100).optional(),
  }),
});
