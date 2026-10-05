import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationPreferenceModel,
  type NotificationChannels,
} from "../../../../infrastructure/db/mongoose/schemas";
import { notificationControllerLogger } from "../../../../infrastructure/logging/childLogger";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

type PreferencesMap = Record<string, NotificationChannels>;

interface PreferencesView {
  preferences: PreferencesMap;
  quietHours: {
    start: string;
    end: string;
    timezone: string;
    enabled: boolean;
  };
  digestFrequency: "off" | "daily" | "weekly";
}

const DEFAULT_QUIET_HOURS = {
  start: "22:00",
  end: "07:00",
  timezone: "Asia/Kolkata",
  enabled: false,
} as const;

/**
 * Load the user's preferences, falling back to the schema defaults when the
 * row does not exist yet. Nothing is persisted until the user saves, so a
 * read never has a side effect.
 */
async function loadPreferences(userId: string): Promise<PreferencesView> {
  const existing = await NotificationPreferenceModel.findOne({
    userId: new Types.ObjectId(userId),
  }).lean();

  if (existing) {
    return {
      preferences: (existing.preferences ?? {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
      }) as PreferencesMap,
      quietHours: {
        ...DEFAULT_QUIET_HOURS,
        ...(existing.quietHours ?? {}),
      },
      digestFrequency: existing.digestFrequency ?? "off",
    };
  }

  return {
    preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    quietHours: { ...DEFAULT_QUIET_HOURS },
    digestFrequency: "off",
  };
}

/** GET /api/v1/notifications/preferences */
const getNotificationPreferences = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);

    const view = await loadPreferences(userId);

    return res.status(200).json(
      new ApiResponse(200, "Notification preferences fetched successfully", {
        preferences: view.preferences,
        quietHours: view.quietHours,
        digestFrequency: view.digestFrequency,
      }),
    );
  },
);

/** PATCH /api/v1/notifications/preferences */
const updateNotificationPreferences = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);

    const body = (req.validated?.body ?? req.body) as {
      preferences?: Record<string, Partial<NotificationChannels>>;
      quietHours?: Partial<PreferencesView["quietHours"]>;
      digestFrequency?: "off" | "daily" | "weekly";
    };

    const current = await loadPreferences(userId);

    // Deep-merge per type so a partial save (e.g. toggling one channel of one
    // type) never drops the other channels.
    const nextPreferences: PreferencesMap = { ...current.preferences };
    if (body.preferences) {
      for (const [type, channels] of Object.entries(body.preferences)) {
        const existing = nextPreferences[type];
        nextPreferences[type] = existing
          ? { ...existing, ...channels }
          : ({ ...channels } as NotificationChannels);
      }
    }

    const nextQuietHours = {
      ...current.quietHours,
      ...(body.quietHours ?? {}),
    };

    const nextDigestFrequency = body.digestFrequency ?? current.digestFrequency;

    const updated = await NotificationPreferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          preferences: nextPreferences,
          quietHours: nextQuietHours,
          digestFrequency: nextDigestFrequency,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    notificationControllerLogger.info(
      { userId, digestFrequency: nextDigestFrequency },
      "Notification preferences updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Notification preferences updated successfully", {
        preferences: updated?.preferences ?? nextPreferences,
        quietHours: updated?.quietHours ?? nextQuietHours,
        digestFrequency: updated?.digestFrequency ?? nextDigestFrequency,
      }),
    );
  },
);

export { getNotificationPreferences, updateNotificationPreferences };
