import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../../../shared/utils/ApiError";
import { HTTP_STATUS } from "../../../shared/constants/http";
import { ERROR_MESSAGE } from "../../../shared/constants/error";

/**
 * Terminal middleware for unmatched routes.
 *
 * Registered AFTER all route definitions but BEFORE the global error
 * handler. Any request that falls through every router hits this and is
 * converted into a 404 ApiError, which then flows through `normalizeError`
 * → `errorHandler` → JSON response.
 *
 * Note: `_res` is unused — we deliberately never send a response here so
 * that the error handler owns the shape and logging of every error.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND, {
      code: "ROUTE_NOT_FOUND",
      errors: [
        {
          field: "route",
          message: `Cannot ${req.method} ${req.originalUrl}`,
          code: "ROUTE_NOT_FOUND",
        },
      ],
      data: {
        method: req.method,
        path: req.originalUrl,
      },
    }),
  );
}
