import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParsedQs } from "qs";

/**
 * `T | Promise<T>` — named as an alias because TypeScript simplifies
 * `unknown | Promise<unknown>` down to plain `unknown`, which silently
 * hides the intent of the union.
 */
type MaybeAsync<T> = T | Promise<T>;

/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * `next()`, which the global error middleware then maps to a JSON response.
 *
 * Only needed on Express 4.x — Express 5 forwards async rejections to
 * `next()` automatically, at which point this wrapper becomes a harmless
 * no-op and can be retired.
 *
 * Why the extra type params?
 *   - Express's `RequestHandler` returns `void | Promise<void>`, so a handler
 *     that ends with `return res.status(200).json(...)` (returning `Response`)
 *     fails strict type-checking. We relax the return type and let Express
 *     ignore it.
 *
 *   - The generic `P / ResBody / ReqBody / ReqQuery` args let callers
 *     strongly type their handlers (e.g. `asyncHandler<{ id: string }>(...)`)
 *     while keeping the wrapper itself generic and reusable.
 *
 *   - `ReqQuery` defaults to `ParsedQs` — Express's actual query type — so
 *     `req.query.page` is `string | string[] | ParsedQs | ParsedQs[] |
 *     undefined`. TypeScript then forces you to narrow before treating it
 *     as a string; a `Record<string, string>` default would happily accept
 *     `req.query.page.startsWith("1")` even though `?page=1&page=2` arrives
 *     as `string[]` at runtime and throws.
 */
export const asyncHandler = <
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => MaybeAsync<unknown>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
