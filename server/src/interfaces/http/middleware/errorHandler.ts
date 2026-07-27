import type { Request, Response, NextFunction } from "express";

import { logger } from "../../../infrastructure/logging/logger";
import { normalizeError } from "../../../shared/errors/normalizeError";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Delegate to Express if the response has already started.
  if (res.headersSent) {
    next(err);
    return;
  }

  const error = normalizeError(err);

  logger.error(
    {
      err,
      statusCode: error.statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    error.message,
  );

  res.status(error.statusCode).json({
    success: error.success,
    message: error.message,
    errors: error.errors,
    data: error.data,
  });
}
