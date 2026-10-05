import { z } from "zod";
import { objectIdSchema } from "../common/objectId";

export const shareBoardSchema = {
  params: z.object({
    boardId: objectIdSchema,
  }),
  body: z.object({
    email: z.string().trim().email("A valid email is required."),
    role: z.enum(["member", "guest"]).optional(),
  }),
};
