import { RequestHandler } from "express"; // 1. Import RequestHandler
import { z, ZodError } from "zod";
import { handleZodError } from "../../../shared/errors/handler/zod";

type AnySchema = z.ZodType<any, any, any>;

interface ValidationSchemas {
  body?: AnySchema;
  params?: AnySchema;
  query?: AnySchema;
}

// 2. Add : RequestHandler return type here
export const validateSchema = (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(handleZodError(error));
      }

      next(error);
    }
  };
