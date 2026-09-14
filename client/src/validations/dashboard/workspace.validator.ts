import { z } from "zod";

export const WORKSPACE_NAME_MIN = 3;
export const WORKSPACE_NAME_MAX = 60;
export const WORKSPACE_SLUG_MIN = 3;
export const WORKSPACE_SLUG_MAX = 40;
export const WORKSPACE_DESCRIPTION_MAX = 280;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createWorkspaceSchema = z.object({
  name: z
    .string({ message: "Name is required." })
    .trim()
    .min(
      WORKSPACE_NAME_MIN,
      `Name must be at least ${WORKSPACE_NAME_MIN} characters.`,
    )
    .max(
      WORKSPACE_NAME_MAX,
      `Name must be ${WORKSPACE_NAME_MAX} characters or less.`,
    ),

  slug: z
    .string({ message: "Slug is required." })
    .trim()
    .min(
      WORKSPACE_SLUG_MIN,
      `Slug must be at least ${WORKSPACE_SLUG_MIN} characters.`,
    )
    .max(
      WORKSPACE_SLUG_MAX,
      `Slug must be ${WORKSPACE_SLUG_MAX} characters or less.`,
    )
    .regex(
      SLUG_RE,
      "Slug may only contain lowercase letters, numbers and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .max(
      WORKSPACE_DESCRIPTION_MAX,
      `Description must be ${WORKSPACE_DESCRIPTION_MAX} characters or less.`,
    )
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

/** Turn an arbitrary string into a URL-safe slug. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
