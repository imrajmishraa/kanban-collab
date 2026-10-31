import type { NotificationType } from "./notification";

export interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface QuietHours {
  start: string;
  end: string;
  timezone: string;
  enabled: boolean;
}

export type DigestFrequency = "off" | "daily" | "weekly";

export interface NotificationPreferences {
  preferences: Partial<Record<NotificationType, NotificationChannels>>;
  quietHours: QuietHours;
  digestFrequency: DigestFrequency;
}

export interface UpdateNotificationPreferencesPayload {
  preferences?: Partial<
    Record<NotificationType, Partial<NotificationChannels>>
  >;
  quietHours?: Partial<QuietHours>;
  digestFrequency?: DigestFrequency;
}

/** Channel columns rendered in the preferences grid. */
export const NOTIFICATION_CHANNELS: ReadonlyArray<keyof NotificationChannels> =
  ["inApp", "email", "push", "sms"];

/** Every notification type the server knows about, in display order. */
export const NOTIFICATION_TYPE_ORDER: ReadonlyArray<NotificationType> = [
  "CARD_ASSIGNED",
  "CARD_MOVED",
  "CARD_DUE_SOON",
  "CARD_OVERDUE",
  "COMMENT_ADDED",
  "MENTION",
  "WORKSPACE_INVITE",
  "WORKSPACE_ROLE_CHANGED",
  "WORKSPACE_DELETION_SCHEDULED",
  "BOARD_SHARED",
];
