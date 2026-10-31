import z from "zod";
import { objectIdSchema } from "./board.validator";

export const COLUMN_NAME_MAX = 100;

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
