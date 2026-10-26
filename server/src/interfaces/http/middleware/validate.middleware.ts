import type { Request, RequestHandler } from "express";
import type { z } from "zod";

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
 *
 * The parsed result is applied back onto `req.body`/`req.params`/`req.query`
 * (H-1) so that schema transforms (`.trim()`, `.toLowerCase()`), coercions
 * (`.coerce.number()`) and defaults actually reach the controllers. `req.validated`
 * is still populated for controllers that prefer to read the typed copy.
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

    /*
     * Apply the parsed result (H-1). Before this, only `req.validated` was set
     * and the raw, un-transformed input was what every controller actually
     * read — so `.trim()`, `.toLowerCase()`, `.coerce` and defaults were all
     * silently discarded.
     *
     * `req.body` and `req.params` are plain writable properties. Express
     * exposes `req.query` through a getter, so it must be redefined rather
     * than assigned.
     */
    if (validated.body !== undefined) {
      req.body = validated.body;
    }

    if (validated.params !== undefined) {
      req.params = validated.params as typeof req.params;
    }

    if (validated.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: validated.query,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    req.validated = validated;
    next();
  };
};
