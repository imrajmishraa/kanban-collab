import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import { NotificationModel } from "../../../../infrastructure/db/mongoose/schemas";
import { notificationControllerLogger } from "../../../../infrastructure/logging/childLogger";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

/**
 * GET /api/v1/notifications
 *
 * The in-app notification feed for the current user. The digest/reminder
 * jobs already write `Notification` rows; this is the read side the UI
 * (bell → panel) was missing.
 */
const listNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 20, 1), 50);
    const unreadOnly = req.query["unread"] === "true";

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (unreadOnly) filter["isRead"] = false;

    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      NotificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      }),
    ]);

    notificationControllerLogger.info(
      { userId, count: notifications.length, unreadCount },
      "Notifications listed",
    );

    return res.status(200).json(
      new ApiResponse(200, "Notifications fetched successfully", {
        notifications: notifications.map((n) => ({
          id: n._id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          readAt: n.readAt,
          workspaceId: n.workspaceId.toString(),
          boardId: n.boardId ? n.boardId.toString() : null,
          cardId: n.cardId ? n.cardId.toString() : null,
          metadata: n.metadata,
          createdAt: n.createdAt,
        })),
        unreadCount,
      }),
    );
  },
);

/** PATCH /api/v1/notifications/:notificationId/read */
const markNotificationRead = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const notificationId = req.params["notificationId"] || req.params["id"];

    if (!notificationId || !Types.ObjectId.isValid(notificationId)) {
      throw ApiError.badRequest("Invalid notification id.");
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw ApiError.notFound("Notification not found.");
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.status(200).json(
      new ApiResponse(200, "Notification marked as read", {
        id: notification._id.toString(),
        isRead: notification.isRead,
      }),
    );
  },
);

/** PATCH /api/v1/notifications/read-all */
const markAllNotificationsRead = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);

    const result = await NotificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    notificationControllerLogger.info(
      { userId, modified: result.modifiedCount },
      "All notifications marked read",
    );

    return res.status(200).json(
      new ApiResponse(200, "All notifications marked as read", {
        modified: result.modifiedCount,
      }),
    );
  },
);

export { listNotifications, markNotificationRead, markAllNotificationsRead };
