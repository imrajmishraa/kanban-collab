import { Request, Response, NextFunction } from "express";

import { ApiError } from "../../../shared/utils/ApiError";
import { HTTP_STATUS } from "../../../shared/constants/http";
import { ERROR_MESSAGE } from "../../../shared/constants/error";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND, [
      `Cannot ${req.method} ${req.originalUrl}`,
    ]),
  );
}
