import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId.");

export const cardParamsSchema = z.object({
  params: z.object({
    cardId: objectIdSchema,
  }),
});

const createCardBodySchema = z.object({
  columnId: objectIdSchema,

  title: z
    .string()
    .trim()
    .min(1, "Card title is required.")
    .max(200, "Card title cannot exceed 200 characters."),

  description: z
    .string()
    .trim()
    .max(10000, "Description cannot exceed 10000 characters.")
    .optional(),

  dueDate: z.string().datetime("Invalid due date.").optional(),

  members: z.array(objectIdSchema).optional(),

  labels: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Label cannot be empty.")
        .max(50, "Label cannot exceed 50 characters."),
    )
    .optional(),
});

export const createCardSchema = z.object({
  body: createCardBodySchema,
});

const updateCardBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Card title cannot be empty.")
      .max(200, "Card title cannot exceed 200 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(10000, "Description cannot exceed 10000 characters.")
      .optional(),

    dueDate: z.string().datetime("Invalid due date.").nullable().optional(),

    members: z.array(objectIdSchema).optional(),

    labels: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Label cannot be empty.")
          .max(50, "Label cannot exceed 50 characters."),
      )
      .optional(),

    isArchived: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update.",
  });

export const updateCardSchema = z.object({
  params: cardParamsSchema.shape.params,
  body: updateCardBodySchema,
});

export const moveCardSchema = z.object({
  params: cardParamsSchema.shape.params,

  body: z.object({
    destinationColumnId: objectIdSchema,

    orderIndex: z
      .number()
      .int()
      .min(0, "Order index must be greater than or equal to 0."),
  }),
});

export const archiveCardSchema = z.object({
  params: cardParamsSchema.shape.params,

  body: z.object({
    isArchived: z.boolean(),
  }),
});
