import { Schema, model, Document, Types, Model } from "mongoose";

export type WorkspaceRole = "owner" | "admin" | "member" | "guest";
export type WorkspaceStatus = "active" | "deletion_pending";
export type BoardVisibility = "private" | "public" | "workspace";
export type Platform = "web" | "ios" | "android" | "desktop";

export type AuthProvider = "password" | "google" | "github";
export const AUTH_PROVIDERS: readonly AuthProvider[] = [
  "password",
  "google",
  "github",
] as const;

export type NotificationType =
  | "CARD_ASSIGNED"
  | "CARD_MOVED"
  | "CARD_DUE_SOON"
  | "CARD_OVERDUE"
  | "COMMENT_ADDED"
  | "MENTION"
  | "WORKSPACE_INVITE"
  | "WORKSPACE_ROLE_CHANGED"
  | "WORKSPACE_DELETION_SCHEDULED"
  | "BOARD_SHARED";

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
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
] as const;

export interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

// 1. USER

export interface IAuthProviderLink {
  provider: AuthProvider;
  providerId: string | null;
  email: string | null;
  linkedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  emailVerified: boolean;
  passwordHash?: string;
  authProviders: IAuthProviderLink[];
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthProviderLinkSchema = new Schema<IAuthProviderLink>(
  {
    provider: {
      type: String,
      enum: ["password", "google", "github"],
      required: true,
    },
    providerId: { type: String, default: null },
    email: { type: String, default: null, lowercase: true, trim: true },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: { type: Boolean, default: false },
    passwordHash: { type: String, select: false },
    authProviders: {
      type: [AuthProviderLinkSchema],
      default: [],
      validate: {
        validator: (providers: IAuthProviderLink[]) => providers.length > 0,
        message: "A user must have at least one auth provider.",
      },
    },
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

UserSchema.index(
  { "authProviders.provider": 1, "authProviders.providerId": 1 },
  {
    partialFilterExpression: {
      "authProviders.providerId": { $type: "string" },
    },
  },
);

export const UserModel: Model<IUser> = model<IUser>("User", UserSchema);

// 2. WORKSPACE

export interface IWorkspaceMember {
  userId: Types.ObjectId;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: IWorkspaceMember[];
  status: WorkspaceStatus;
  deletionRequestedAt: Date | null;
  deletionScheduledFor: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: { type: String },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member", "guest"],
          default: "member",
        },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: ["active", "deletion_pending"],
      default: "active",
      index: true,
    },
    deletionRequestedAt: { type: Date, default: null },
    deletionScheduledFor: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

WorkspaceSchema.index({ "members.userId": 1 });
WorkspaceSchema.index({ ownerId: 1, status: 1 });
WorkspaceSchema.index({ status: 1, deletionScheduledFor: 1 });

export const WorkspaceModel: Model<IWorkspace> = model<IWorkspace>(
  "Workspace",
  WorkspaceSchema,
);

// 3. BOARD

export interface IBoard extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  backgroundColor: string;
  coverImageUrl?: string;
  visibility: BoardVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    backgroundColor: { type: String, default: "#2b6cb0" },
    coverImageUrl: { type: String },
    visibility: {
      type: String,
      enum: ["private", "public", "workspace"],
      default: "workspace",
    },
  },
  { timestamps: true },
);

BoardSchema.index({ workspaceId: 1, createdAt: -1 });

export const BoardModel: Model<IBoard> = model<IBoard>("Board", BoardSchema);

// 4. COLUMN

export interface IColumn extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  boardId: Types.ObjectId;
  name: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    orderIndex: { type: Number, required: true },
  },
  { timestamps: true },
);

ColumnSchema.index({ boardId: 1, orderIndex: 1 });

export const ColumnModel: Model<IColumn> = model<IColumn>(
  "Column",
  ColumnSchema,
);

// 5. CARD

export interface IChecklistItem {
  title: string;
  isCompleted: boolean;
}

export interface ICustomFieldValue {
  fieldId: string;
  value: unknown;
}

export interface ICard extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  columnId: Types.ObjectId;
  boardId: Types.ObjectId;
  title: string;
  description: string;
  orderIndex: number;
  dueDate?: Date;
  members: Types.ObjectId[];
  labels: string[];
  checklists: IChecklistItem[];
  customFieldValues: ICustomFieldValue[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    orderIndex: { type: Number, required: true },
    dueDate: { type: Date, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    labels: [{ type: String }],
    checklists: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        _id: false,
      },
    ],
    customFieldValues: [
      {
        fieldId: { type: String, required: true },
        value: { type: Schema.Types.Mixed },
        _id: false,
      },
    ],
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

CardSchema.index({ columnId: 1, orderIndex: 1 });
CardSchema.index({ boardId: 1, isArchived: 1, orderIndex: 1 });
CardSchema.index({ title: "text", description: "text" });
CardSchema.index({ dueDate: 1, isArchived: 1 });
CardSchema.index({ members: 1, isArchived: 1 });

export const CardModel: Model<ICard> = model<ICard>("Card", CardSchema);

// 6. COMMENT

export interface IComment extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  cardId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

CommentSchema.index({ cardId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });

export const CommentModel: Model<IComment> = model<IComment>(
  "Comment",
  CommentSchema,
);

// 7. ACTIVITY LOG

export type ActivityActionType =
  | "CARD_CREATE"
  | "CARD_UPDATE"
  | "CARD_MOVE"
  | "CARD_ARCHIVE"
  | "CARD_DELETE"
  | "CARD_ASSIGN"
  | "CARD_UNASSIGN"
  | "COMMENT_ADD"
  | "COMMENT_DELETE"
  | "COLUMN_CREATE"
  | "COLUMN_UPDATE"
  | "COLUMN_DELETE"
  | "BOARD_CREATE"
  | "BOARD_UPDATE"
  | "BOARD_DELETE"
  | "MEMBER_INVITE"
  | "MEMBER_REMOVE"
  | "MEMBER_ROLE_CHANGE";

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  boardId: Types.ObjectId;
  userId: Types.ObjectId;
  actionType: ActivityActionType;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actionType: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true },
);

ActivityLogSchema.index({ boardId: 1, createdAt: -1 });
ActivityLogSchema.index({ workspaceId: 1, actionType: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLogModel: Model<IActivityLog> = model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema,
);

// 8. SESSION

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userEmail: string;
  userFullName: string;
  jti: string;
  previousJti?: string | null;
  previousJtiExpiresAt?: Date | null;
  rememberMe: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
  revokedAt?: Date | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: { type: String, required: true },
    userFullName: { type: String, required: true },
    jti: { type: String, required: true, unique: true },
    previousJti: { type: String },
    previousJtiExpiresAt: { type: Date, default: null },
    rememberMe: { type: Boolean, default: false },
    userAgent: { type: String },
    ipAddress: { type: String },
    deviceId: { type: String },
    platform: {
      type: String,
      enum: ["web", "ios", "android", "desktop"],
    },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1, revokedAt: 1, createdAt: -1 });
SessionSchema.index(
  { previousJti: 1, previousJtiExpiresAt: 1 },
  { sparse: true },
);

export const SessionModel: Model<ISession> = model<ISession>(
  "Session",
  SessionSchema,
);

// 9. YJS DOCUMENT UPDATES

export interface IYjsUpdate extends Document {
  _id: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  boardId?: Types.ObjectId;
  docName: string;
  update: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const YjsUpdateSchema = new Schema<IYjsUpdate>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: false,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: false,
      index: true,
    },
    docName: { type: String, required: true, unique: true },
    update: { type: Buffer, required: true },
  },
  { timestamps: true },
);

YjsUpdateSchema.index({ boardId: 1, createdAt: -1 });

export const YjsUpdateModel: Model<IYjsUpdate> = model<IYjsUpdate>(
  "YjsUpdate",
  YjsUpdateSchema,
);

// 10. NOTIFICATION

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  actorId?: Types.ObjectId;
  workspaceId: Types.ObjectId;
  boardId?: Types.ObjectId;
  cardId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: Date | null;
  channels: NotificationChannels;
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", index: true },
    cardId: { type: Schema.Types.ObjectId, ref: "Card", index: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    dedupeKey: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ boardId: 1, createdAt: -1 });
NotificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, sparse: true },
);
NotificationSchema.index(
  { readAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 90,
    partialFilterExpression: { isRead: true },
  },
);

export const NotificationModel: Model<INotification> = model<INotification>(
  "Notification",
  NotificationSchema,
);

// 11. NOTIFICATION PREFERENCE

export interface INotificationPreference extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  preferences: Record<NotificationType, NotificationChannels>;
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
    enabled: boolean;
  };
  digestFrequency: "off" | "daily" | "weekly";
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: Record<
  NotificationType,
  NotificationChannels
> = {
  CARD_ASSIGNED: { inApp: true, email: true, push: true, sms: false },
  CARD_MOVED: { inApp: true, email: false, push: false, sms: false },
  CARD_DUE_SOON: { inApp: true, email: true, push: true, sms: false },
  CARD_OVERDUE: { inApp: true, email: true, push: true, sms: true },
  COMMENT_ADDED: { inApp: true, email: true, push: false, sms: false },
  MENTION: { inApp: true, email: true, push: true, sms: false },
  WORKSPACE_INVITE: { inApp: true, email: true, push: false, sms: false },
  WORKSPACE_ROLE_CHANGED: { inApp: true, email: true, push: false, sms: false },
  WORKSPACE_DELETION_SCHEDULED: {
    inApp: true,
    email: true,
    push: false,
    sms: false,
  },
  BOARD_SHARED: { inApp: true, email: false, push: false, sms: false },
};

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_NOTIFICATION_PREFERENCES }),
    },
    quietHours: {
      start: { type: String, default: "22:00" },
      end: { type: String, default: "07:00" },
      timezone: { type: String, default: "Asia/Kolkata" },
      enabled: { type: Boolean, default: false },
    },
    digestFrequency: {
      type: String,
      enum: ["off", "daily", "weekly"],
      default: "off",
    },
  },
  { timestamps: true },
);

export const NotificationPreferenceModel: Model<INotificationPreference> =
  model<INotificationPreference>(
    "NotificationPreference",
    NotificationPreferenceSchema,
  );

// MODELS AGGREGATOR

export const models = {
  User: UserModel,
  Workspace: WorkspaceModel,
  Board: BoardModel,
  Column: ColumnModel,
  Card: CardModel,
  Comment: CommentModel,
  ActivityLog: ActivityLogModel,
  Session: SessionModel,
  YjsUpdate: YjsUpdateModel,
  Notification: NotificationModel,
  NotificationPreference: NotificationPreferenceModel,
} as const;
