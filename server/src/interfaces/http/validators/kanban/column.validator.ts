import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId.");

export const columnParamsSchema = z.object({
  params: z.object({
    columnId: objectIdSchema,
  }),
});

export const createColumnSchema = z.object({
  body: z.object({
    boardId: objectIdSchema,

    name: z
      .string()
      .trim()
      .min(1, "Column name is required.")
      .max(100, "Column name cannot exceed 100 characters."),

    orderIndex: z
      .number()
      .int()
      .min(0, "Order index must be greater than or equal to 0."),
  }),
});

const updateColumnBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Column name cannot be empty.")
      .max(100, "Column name cannot exceed 100 characters.")
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

export const updateColumnSchema = z.object({
  params: columnParamsSchema.shape.params,
  body: updateColumnBodySchema,
});

export const moveColumnSchema = z.object({
  params: columnParamsSchema.shape.params,

  body: z.object({
    orderIndex: z
      .number()
      .int()
      .min(0, "Order index must be greater than or equal to 0."),
  }),
});
