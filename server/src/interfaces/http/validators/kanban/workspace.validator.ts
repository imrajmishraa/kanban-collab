import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId.");

const slugRegex = /^[a-z0-9-]+$/;

export const workspaceParamsSchema = z.object({
  params: z.object({
    workspaceId: objectIdSchema,
  }),
});

const createWorkspaceBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(100, "Workspace name cannot exceed 100 characters."),

  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(100, "Slug cannot exceed 100 characters.")
    .regex(
      slugRegex,
      "Slug may only contain lowercase letters, numbers, and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),
});

export const createWorkspaceSchema = z.object({
  body: createWorkspaceBodySchema,
});

const updateWorkspaceBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Workspace name must be at least 3 characters.")
      .max(100, "Workspace name cannot exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export const updateWorkspaceSchema = z.object({
  params: workspaceParamsSchema.shape.params,
  body: updateWorkspaceBodySchema,
});
