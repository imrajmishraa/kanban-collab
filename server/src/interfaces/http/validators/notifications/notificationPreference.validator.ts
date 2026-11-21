import { z } from "zod";

import { NOTIFICATION_TYPES } from "../../../../infrastructure/db/mongoose/schemas";

/**
 * Notification types are owned by the schema (`NOTIFICATION_TYPES`), so the
 * validator derives its enum from that list rather than duplicating it — a new
 * type added to the schema is accepted here automatically.
 */
const notificationTypeSchema = z.enum(
  NOTIFICATION_TYPES as unknown as [string, ...string[]],
);

const channelSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
});

const quietHoursSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM (24-hour)."),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM (24-hour)."),
    timezone: z.string().trim().min(1, "Timezone is required."),
    enabled: z.boolean(),
  })
  .partial();

export const updateNotificationPreferencesSchema = {
  body: z
    .object({
      /*
       * `partialRecord`, not `record`.
       *
       * In Zod 4 a `record` whose key is an enum is *exhaustive*: every enum
       * member is required. `z.record(notificationTypeSchema, …)` therefore
       * demanded all ten types, and a patch for one type — which is exactly what
       * the inbox's "Mute" sends — failed validation with
       * "expected object, received undefined" once per missing type. The settings
       * screen only ever sent the full map, so nothing caught it.
       *
       * `partialRecord` keeps the key constrained to the enum while allowing a
       * subset, which is what a patch means. The controller already deep-merges
       * per type, so a single-type save does not drop the others.
       */
      preferences: z
        .partialRecord(notificationTypeSchema, channelSchema.partial())
        .optional(),
      quietHours: quietHoursSchema.optional(),
      digestFrequency: z.enum(["off", "daily", "weekly"]).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided for update.",
    }),
};
