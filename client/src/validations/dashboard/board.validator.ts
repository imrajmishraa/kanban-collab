import { z } from "zod";

/* ── Shared primitives ───────────────────────────────────── */

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/, "Invalid id format.");

export const boardVisibilitySchema = z.enum(["private", "public", "workspace"]);

const HEX_COLOR_RE = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/* ── Limits — kept in step with the server validators ────── */

export const BOARD_NAME_MIN = 3;
export const BOARD_NAME_MAX = 100;
export const BOARD_DESCRIPTION_MAX = 500;
export const COLUMN_NAME_MAX = 100;
export const CARD_TITLE_MAX = 200;
export const CARD_DESCRIPTION_MAX = 10000;
export const CARD_LABEL_MAX = 50;

/* ── Board ───────────────────────────────────────────────── */

export const createBoardSchema = z.object({
  workspaceId: objectIdSchema,

  name: z
    .string()
    .trim()
    .min(
      BOARD_NAME_MIN,
      `Board name must be at least ${BOARD_NAME_MIN} characters.`,
    )
    .max(
      BOARD_NAME_MAX,
      `Board name cannot exceed ${BOARD_NAME_MAX} characters.`,
    ),

  description: z
    .string()
    .trim()
    .max(
      BOARD_DESCRIPTION_MAX,
      `Description cannot exceed ${BOARD_DESCRIPTION_MAX} characters.`,
    )
    .optional(),

  backgroundColor: z
    .string()
    .regex(HEX_COLOR_RE, "Invalid background color.")
    .optional(),

  coverImageUrl: z.string().trim().url("Invalid cover image URL.").optional(),

  visibility: boardVisibilitySchema.optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        BOARD_NAME_MIN,
        `Board name must be at least ${BOARD_NAME_MIN} characters.`,
      )
      .max(
        BOARD_NAME_MAX,
        `Board name cannot exceed ${BOARD_NAME_MAX} characters.`,
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        BOARD_DESCRIPTION_MAX,
        `Description cannot exceed ${BOARD_DESCRIPTION_MAX} characters.`,
      )
      .optional(),

    backgroundColor: z
      .string()
      .regex(HEX_COLOR_RE, "Invalid background color.")
      .optional(),

    coverImageUrl: z.string().trim().url("Invalid cover image URL.").optional(),

    visibility: boardVisibilitySchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

/* ── Column ──────────────────────────────────────────────── */

export const createColumnSchema = z.object({
  boardId: objectIdSchema,

  name: z
    .string()
    .trim()
    .min(1, "Column name is required.")
    .max(
      COLUMN_NAME_MAX,
      `Column name cannot exceed ${COLUMN_NAME_MAX} characters.`,
    ),

  orderIndex: z
    .number()
    .int()
    .min(0, "Order index must be greater than or equal to 0."),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Column name cannot be empty.")
      .max(
        COLUMN_NAME_MAX,
        `Column name cannot exceed ${COLUMN_NAME_MAX} characters.`,
      )
      .optional(),

    orderIndex: z
      .number()
      .int()
      .min(0, "Order index must be greater than or equal to 0.")
      .optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

/* ── Card ────────────────────────────────────────────────── */

export const createCardSchema = z.object({
  columnId: objectIdSchema,
  boardId: objectIdSchema,

  title: z
    .string()
    .trim()
    .min(1, "Card title is required.")
    .max(
      CARD_TITLE_MAX,
      `Card title cannot exceed ${CARD_TITLE_MAX} characters.`,
    ),

  description: z
    .string()
    .trim()
    .max(
      CARD_DESCRIPTION_MAX,
      `Description cannot exceed ${CARD_DESCRIPTION_MAX} characters.`,
    )
    .optional(),

  dueDate: z.string().datetime("Invalid due date.").optional(),

  members: z.array(objectIdSchema).optional(),

  labels: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Label cannot be empty.")
        .max(
          CARD_LABEL_MAX,
          `Label cannot exceed ${CARD_LABEL_MAX} characters.`,
        ),
    )
    .optional(),

  orderIndex: z
    .number()
    .int()
    .min(0, "Order index must be greater than or equal to 0.")
    .optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Card title cannot be empty.")
      .max(
        CARD_TITLE_MAX,
        `Card title cannot exceed ${CARD_TITLE_MAX} characters.`,
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        CARD_DESCRIPTION_MAX,
        `Description cannot exceed ${CARD_DESCRIPTION_MAX} characters.`,
      )
      .optional(),

    dueDate: z.string().datetime("Invalid due date.").nullable().optional(),

    members: z.array(objectIdSchema).optional(),

    labels: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Label cannot be empty.")
          .max(
            CARD_LABEL_MAX,
            `Label cannot exceed ${CARD_LABEL_MAX} characters.`,
          ),
      )
      .optional(),

    isArchived: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export const moveCardSchema = z.object({
  targetColumnId: objectIdSchema,

  targetOrderIndex: z
    .number()
    .int()
    .min(0, "Order index must be greater than or equal to 0."),
});

export type MoveCardInput = z.infer<typeof moveCardSchema>;
