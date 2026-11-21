import { z } from "zod";
import { objectIdSchema } from "../common/objectId";

/** `req.params` for card-scoped attachment routes. */
export const cardOnlyParamsSchema = z.object({
  cardId: objectIdSchema,
});

/** `req.params` for a single attachment. */
export const cardAttachmentParamsSchema = z.object({
  cardId: objectIdSchema,
  attachmentId: objectIdSchema,
});

/**
 * A URL that is safe to put in an `href`.
 *
 * `z.string().url()` is not that check. Zod 4 delegates to `new URL()`, which
 * accepts *any* scheme — `javascript:alert(1)`, `data:text/html;base64,…`,
 * `file:///etc/passwd` and `vbscript:` all pass. The client renders this value
 * straight into an anchor (`CardAttachments.tsx`), so a member could store a
 * link that runs script in every other member's session: stored XSS with one
 * click of delivery.
 *
 * Only `https` is accepted. `http` is refused too — nothing this app produces
 * is plain http, and a link that can be downgraded is a link that can be
 * swapped in transit.
 */
export const attachmentUrlSchema = z
  .string()
  .trim()
  .url("Attachment URL must be a valid URL.")
  /* The `try` is not decoration: Zod 4 runs every check on the chain, so this
     one also sees a value `.url()` already rejected. A bare `new URL(value)`
     would throw there and turn a 400 into a 500. */
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Attachment URL must use https.");

export const addAttachmentSchema = {
  params: cardOnlyParamsSchema,
  body: z.object({
    url: attachmentUrlSchema,
    name: z.string().trim().min(1, "File name is required.").max(255),
    fileType: z.string().trim().min(1, "File type is required.").max(120),
    size: z.number().int().nonnegative().optional(),
  }),
};
