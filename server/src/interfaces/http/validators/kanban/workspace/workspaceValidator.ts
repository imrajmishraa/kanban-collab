import { z } from "zod";
import { objectIdSchema } from "../../common/objectId";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const workspaceParamsSchema = z.object({
  workspaceId: objectIdSchema,
});

export const createWorkspaceSchema = {
  body: z.object({
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
  }),
};

export const updateWorkspaceSchema = {
  params: workspaceParamsSchema,

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Workspace name must be at least 3 characters.")
        .max(100, "Workspace name cannot exceed 100 characters.")
        .optional(),

      slug: z
        .string()
        .trim()
        .min(3, "Slug must be at least 3 characters.")
        .max(100, "Slug cannot exceed 100 characters.")
        .regex(
          slugRegex,
          "Slug may only contain lowercase letters, numbers, and hyphens.",
        )
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters.")
        .optional(),

      /**
       * ImageKit URL produced by the client-side upload, or null to remove it.
       *
       * Without this key zod strips it as unknown, which leaves an empty body
       * and trips the refinement below, so the PATCH answers 422 even though
       * the upload itself succeeded.
       */
      avatarUrl: z
        .string()
        .trim()
        .url("Avatar must be a valid URL.")
        .max(2048, "Avatar URL is too long.")
        .nullable()
        .optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided for update.",
    }),
};

export const addWorkspaceMemberSchema = {
  params: z.object({
    id: objectIdSchema,
  }),

  body: z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member", "guest", "owner"]).optional(),
  }),
};

export const listWorkspacesQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
