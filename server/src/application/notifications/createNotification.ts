import { Types } from "mongoose";

import {
  NotificationModel,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../../infrastructure/db/mongoose/schemas";
import type {
  NotificationType,
  NotificationChannels,
} from "../../infrastructure/db/mongoose/schemas";
import { notificationLogger } from "../../infrastructure/logging/childLogger";

export interface CreateNotificationInput {
  /** Recipient. */
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  workspaceId: string | Types.ObjectId;
  boardId?: string | Types.ObjectId | null;
  cardId?: string | Types.ObjectId | null;
  commentId?: string | Types.ObjectId | null;
  /** Who triggered it (optional). */
  actorId?: string | Types.ObjectId | null;
  metadata?: Record<string, unknown>;
  /**
   * Idempotency key. The schema has a unique sparse index on
   * `{ userId, dedupeKey }`, so a repeated emit is rejected as a duplicate
   * rather than creating a second row.
   */
  dedupeKey?: string;
  /** Per-type channel overrides; otherwise the type's defaults are used. */
  channels?: Partial<NotificationChannels>;
}

export interface CreateNotificationResult {
  /** `true` when a new row was written, `false` when deduped. */
  created: boolean;
  id: string | null;
}

function toObjectId(value: string | Types.ObjectId): Types.ObjectId {
  return value instanceof Types.ObjectId ? value : new Types.ObjectId(value);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Create an in-app notification, respecting the per-type channel defaults.
 *
 * Dedupe is handled by the unique index on `{ userId, dedupeKey }` — a
 * duplicate emit returns `{ created: false }` instead of throwing, so callers
 * (e.g. the 15-minute due-reminder cron) can safely re-run.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<CreateNotificationResult> {
  const channels: NotificationChannels = {
    ...DEFAULT_NOTIFICATION_PREFERENCES[input.type],
    ...input.channels,
  };

  try {
    const created = await NotificationModel.create({
      userId: toObjectId(input.userId),
      workspaceId: toObjectId(input.workspaceId),
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? {},
      channels,
      // Conditional spreads keep `undefined` out of the document so the
      // `exactOptionalPropertyTypes` contract holds.
      ...(input.actorId ? { actorId: toObjectId(input.actorId) } : {}),
      ...(input.boardId ? { boardId: toObjectId(input.boardId) } : {}),
      ...(input.cardId ? { cardId: toObjectId(input.cardId) } : {}),
      ...(input.commentId ? { commentId: toObjectId(input.commentId) } : {}),
      ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
    });

    notificationLogger.info(
      {
        notificationId: created._id,
        userId: input.userId,
        type: input.type,
      },
      "Notification created",
    );

    return { created: true, id: created._id.toString() };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      notificationLogger.debug(
        { userId: input.userId, type: input.type, dedupeKey: input.dedupeKey },
        "Notification deduped",
      );
      return { created: false, id: null };
    }

    notificationLogger.error(
      { err: error, userId: input.userId, type: input.type },
      "Failed to create notification",
    );
    throw error;
  }
}
