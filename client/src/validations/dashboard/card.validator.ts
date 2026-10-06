import z from "zod";
import { objectIdSchema } from "./board.validator";

export const CARD_TITLE_MAX = 200;
export const CARD_DESCRIPTION_MAX = 10000;
export const CARD_LABEL_MAX = 50;

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

export const moveCardSchema = z.object({
  targetColumnId: objectIdSchema,

  targetOrderIndex: z
    .number()
    .int()
    .min(0, "Order index must be greater than or equal to 0."),
});
