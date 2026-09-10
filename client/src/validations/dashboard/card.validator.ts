import { z } from "zod";

export const createCardSchema = z.object({
  columnId: z.string().min(1, "Please select a column."),

  title: z
    .string()
    .trim()
    .min(1, "Card title is required.")
    .max(200, "Card title must not exceed 200 characters."),
});

export const updateCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Card title is required.")
    .max(200, "Card title must not exceed 200 characters."),

  columnId: z.string().min(1, "Column ID is required.").optional(),
});

export const moveCardSchema = z.object({
  targetColumnId: z.string().min(1, "Please select a target column."),

  targetOrderIndex: z.number().finite(),
});


// Form data
export type CreateCardFormData = z.infer<typeof createCardSchema>;
export type UpdateCardFormData = z.infer<typeof updateCardSchema>;
export type MoveCardFormData = z.infer<typeof moveCardSchema>;
