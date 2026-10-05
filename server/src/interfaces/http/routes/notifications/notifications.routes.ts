import { Router } from "express";
import { z } from "zod";

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../controllers/notifications/notifications";

import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";
import { objectIdSchema } from "../../validators/common/objectId";

const router = Router();

router.use(authenticateJWT);

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
