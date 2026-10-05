import { Router } from "express";
import { z } from "zod";

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../controllers/notifications/notifications";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../controllers/notifications/notificationPreferences";
import { updateNotificationPreferencesSchema } from "../../validators/notifications/notificationPreference.validator";

import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";
import { objectIdSchema } from "../../validators/common/objectId";

const router = Router();

router.use(authenticateJWT);

// NOTIFICATION PREFERENCES
//
// Declared before the parameterised routes so `/preferences` can never be
// captured as a `:notificationId`.

// GET /api/v1/notifications/preferences
router.get("/preferences", getNotificationPreferences);

// PATCH /api/v1/notifications/preferences
router.patch(
  "/preferences",
  validateSchema(updateNotificationPreferencesSchema),
  updateNotificationPreferences,
);

// GET /api/v1/notifications
router.get("/", listNotifications);

// PATCH /api/v1/notifications/read-all
router.patch("/read-all", markAllNotificationsRead);

// PATCH /api/v1/notifications/:notificationId/read
router.patch(
  "/:notificationId/read",
  validateSchema({
    params: z.object({ notificationId: objectIdSchema }),
  }),
  markNotificationRead,
);

export default router;
