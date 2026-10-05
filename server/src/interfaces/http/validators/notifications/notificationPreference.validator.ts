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
      preferences: z
        .record(notificationTypeSchema, channelSchema.partial())
        .optional(),
      quietHours: quietHoursSchema.optional(),
      digestFrequency: z.enum(["off", "daily", "weekly"]).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided for update.",
    }),
};
