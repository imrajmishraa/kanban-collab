import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * `next()`, which the global error middleware then maps to a JSON response.
 *
 * Why the extra type params?
 *   - Express's `RequestHandler` returns `void | Promise<void>`, so a handler
 *     that ends with `return res.status(200).json(...)` (returning `Response`)
 *     fails strict type-checking. We relax the return type to `unknown` and
 *     let Express ignore it.
 *
 *   - The generic `P / ResBody / ReqBody / ReqQuery` args let callers
 *     strongly type their handlers (e.g. `asyncHandler<{ id: string }>(...)`)
 *     while keeping the wrapper itself generic and reusable.
 */
export const asyncHandler = <
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string>,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => unknown | Promise<unknown>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
