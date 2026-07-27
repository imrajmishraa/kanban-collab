import { RequestHandler } from "express";
import { z } from "zod";

import { handleZodError } from "../../../shared/errors/handler/zod";

type AnySchema = z.ZodTypeAny;

interface ValidationSchemas {
  body?: AnySchema;
  params?: AnySchema;
  query?: AnySchema;
}

export const validateSchema = (schemas: ValidationSchemas): RequestHandler => {
  return (req, _res, next) => {
    const validations = [
      {
        schema: schemas.body,
        value: req.body,
        assign: (data: unknown) => {
          req.body = data;
        },
      },
      {
        schema: schemas.params,
        value: req.params,
        assign: (data: unknown) => {
          req.params = data as typeof req.params;
        },
      },
      {
        schema: schemas.query,
        value: req.query,
        assign: (data: unknown) => {
          req.query = data as typeof req.query;
        },
      },
    ];

    for (const validation of validations) {
      if (!validation.schema) continue;

      const result = validation.schema.safeParse(validation.value);

      if (!result.success) {
        return next(handleZodError(result.error));
      }

      validation.assign(result.data);
    }

    next();
  };
};
