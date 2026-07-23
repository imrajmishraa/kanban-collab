import { Request, Response, NextFunction } from "express";
import { normalizeError } from "../../../shared/errors/normalizeError";
import { logger } from "../../../infrastructure/logging/logger";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled server error",
  );

  const error = normalizeError(err);

  return res.status(error.statusCode).json({
    success: error.success,
    message: error.message,
    errors: error.errors,
    data: error.data,
  });
};

export { errorHandler };
