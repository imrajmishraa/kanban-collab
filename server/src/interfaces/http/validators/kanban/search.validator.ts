import { z } from "zod";

import { objectIdSchema } from "../common/objectId";

/**
 * `GET /cards/search` — the query string, which used to be unvalidated.
 *
 * The controller read `req.query` raw, so `?q=a&q=b` arrived as an array, went
 * into `$text.$search` and came back as a 500; `?boardId=` with two values was
 * cast `as string` and blew up in `findById`. Nothing bounded the result set
 * either: a one-letter query could return a whole board.
 *
 * `limit` is capped rather than open: the palette asks for the first screen of
 * matches, and the endpoint should not be a way to page out a board one request
 * at a time.
 */
export const searchCardsQuerySchema = z.object({
  boardId: objectIdSchema,
  q: z
    .string()
    .trim()
    .min(1, "A search query is required.")
    .max(100, "A search query is limited to 100 characters."),
  limit: z.coerce
    .number()
    .int()
    .min(1, "limit must be at least 1.")
    .max(50, "limit is capped at 50.")
    .optional()
    .default(20),
});
