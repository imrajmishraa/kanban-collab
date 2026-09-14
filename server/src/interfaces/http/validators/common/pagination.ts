import { z } from "zod";

/**
 * Offset-based pagination for list endpoints.
 *
 * - `page`  — 1-indexed. `?page=abc` falls back to 1 instead of erroring.
 * - `limit` — clamped to [1, 100]. Prevents `?limit=100000` DoS.
 * - `sortBy` — field name, defaults to `createdAt`.
 * - `sortOrder` — asc/desc, defaults to `desc`.
 *
 * Use `.catch()` on page/limit so a bad query param degrades gracefully.
 * sortBy is left strict — invalid field names should fail loudly so
 * controllers don't get garbage input.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).catch(20).default(20),

  sortBy: z.string().trim().min(1).max(40).optional(),

  sortOrder: z.enum(["asc", "desc"]).catch("desc").default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Cursor-based pagination — for feeds that change frequently
 * (activity logs, notifications, comments).
 *
 * Clients pass `cursor` (opaque token — usually the last item's `_id`
 * or a base64-encoded `{ createdAt, _id }` tuple) and receive `nextCursor`
 * in the response.
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).catch(20).default(20),
});

export type CursorPaginationQuery = z.infer<typeof cursorPaginationSchema>;
