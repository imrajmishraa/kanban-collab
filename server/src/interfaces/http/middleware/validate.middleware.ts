import type { Request, RequestHandler } from "express";
import { z } from "zod";

import { ApiError } from "../../../shared/utils/ApiError";
import { HTTP_STATUS } from "../../../shared/constants/http";
import { ERROR_MESSAGE } from "../../../shared/constants/error";

type AnySchema = z.ZodTypeAny;

interface ValidationSchemas {
  body?: AnySchema;
  params?: AnySchema;
  query?: AnySchema;
}

/**
 * Augment Express's Request with validated, typed payloads.
 * The originals (`req.body`, `req.params`, `req.query`) remain untouched
 * so downstream middleware doesn't depend on this file's mutations.
 */
declare module "express-serve-static-core" {
  interface Request {
    validated?: {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };
  }
}

export const validateSchema = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res, next) => {
    const targets = [
      { schema: schemas.body, value: req.body, key: "body" as const },
      { schema: schemas.params, value: req.params, key: "params" as const },
      { schema: schemas.query, value: req.query, key: "query" as const },
    ];

    const collectedErrors: Array<{
      location: "body" | "params" | "query";
      field: string;
      message: string;
      code: string;
    }> = [];

    const validated: NonNullable<Request["validated"]> = {};

    for (const { schema, value, key } of targets) {
      if (!schema) continue;

      const result = schema.safeParse(value);

      if (result.success) {
        validated[key] = result.data;
        continue;
      }

      for (const issue of result.error.issues) {
        collectedErrors.push({
          location: key,
          field: issue.path.length > 0 ? issue.path.join(".") : "root",
          message: issue.message,
          code: issue.code,
        });
      }
    }

    if (collectedErrors.length > 0) {
      return next(
        new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_MESSAGE.VALIDATION_FAILED,
          {
            code: "VALIDATION_FAILED",
            errors: collectedErrors,
          },
        ),
      );
    }

    req.validated = validated;
    next();
  };
};
