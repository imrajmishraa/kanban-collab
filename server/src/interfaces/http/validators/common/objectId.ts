import { z } from "zod";

/**
 * MongoDB ObjectId — 24-character lowercase hex string.
 *
 * Case-sensitive on purpose: MongoDB stores lowercase, and being strict here
 * catches client bugs where an ID was uppercased somewhere in transit.
 */
export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/, "Invalid ObjectId format.");

/**
 * Branded version — the resulting type is `string & { __brand: "ObjectId" }`,
 * which prevents accidentally passing any plain string where an ObjectId is
 * required at the type level.
 */
export const brandedObjectIdSchema = objectIdSchema.brand<"ObjectId">();

export type ObjectIdString = z.infer<typeof brandedObjectIdSchema>;

/**
 * Convenience for `req.params` — turns `{ id: "..." }` into a validated
 * object with a branded ObjectId.
 */
export const idParamSchema = z.object({
  id: objectIdSchema,
});
