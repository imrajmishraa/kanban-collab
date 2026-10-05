import { logger } from "./logger";

export type ModuleName =
  | "http"
  | "auth"
  | "websocket"
  | "collaboration"
  | "persistence"
  | "database"
  | "security"
  | "lifecycle"
  | "cron"
  | "redis"
  | "notification"
  | "storage"
  | "rate-limit";

export type ControllerName =
  | "auth"
  | "dashboard"
  | "board"
  | "workspace"
  | "card"
  | "column"
  | "comment"
  | "notification"
  | "note"
  | "activity"
  | "search"
  | "file-upload";

export type WebsocketComponentName =
  | "server"
  | "bootstrap"
  | "authenticate"
  | "authorize"
  | "heartbeat"
  | "connection-registry"
  | "message-handler"
  | "notification-socket";

export type CollaborationComponentName =
  "yjs" | "awareness" | "sync" | "document-manager" | "managed-document";

export type JobName =
  | "workspace-cleanup"
  | "yjs-snapshot"
  | "notification-due-reminder"
  | "notification-digest"
  | "self-ping";

export type DeliveryChannel = "email" | "sms" | "push";

// ─── FACTORIES — create child loggers with an extra scoping field ─────────

/** Scoped logger for a top-level functional area not covered below. */
export const createModuleLogger = (module: ModuleName) =>
  logger.child({ module });

export const createControllerLogger = (controller: ControllerName) =>
  logger.child({ module: "http", controller });

export const createWebsocketComponentLogger = (
  component: WebsocketComponentName,
) => logger.child({ module: "websocket", component });

export const createCollaborationComponentLogger = (
  component: CollaborationComponentName,
) => logger.child({ module: "collaboration", component });

export const createJobSchedulerLogger = (job: JobName) =>
  logger.child({ module: "cron", job });

export const createDeliveryLogger = (channel: DeliveryChannel) =>
  logger.child({ module: "notification", channel });

// ─── MODULE-LEVEL LOGGERS — one per functional area ────────────────────────

export const httpLogger = createModuleLogger("http");
export const authLogger = createModuleLogger("auth");
export const websocketLogger = createModuleLogger("websocket");
export const collaborationLogger = createModuleLogger("collaboration");
export const persistenceLogger = createModuleLogger("persistence");
export const databaseLogger = createModuleLogger("database");
export const securityLogger = createModuleLogger("security");
export const lifecycleLogger = createModuleLogger("lifecycle");
export const schedulerLogger = createModuleLogger("cron");

// Subsystems for the notification + scaling layers
export const redisLogger = createModuleLogger("redis");
export const notificationLogger = createModuleLogger("notification");
export const storageLogger = createModuleLogger("storage");
export const rateLimitLogger = createModuleLogger("rate-limit");

// ─── HTTP CONTROLLER LOGGERS ───────────────────────────────────────────────

export const authControllerLogger = createControllerLogger("auth");
export const dashboardControllerLogger = createControllerLogger("dashboard");
export const boardControllerLogger = createControllerLogger("board");
export const workspaceControllerLogger = createControllerLogger("workspace");
export const cardControllerLogger = createControllerLogger("card");
export const columnControllerLogger = createControllerLogger("column");
export const commentControllerLogger = createControllerLogger("comment");
export const notificationControllerLogger =
  createControllerLogger("notification");
export const noteControllerLogger = createControllerLogger("note");
export const activityControllerLogger = createControllerLogger("activity");
export const searchControllerLogger = createControllerLogger("search");
export const fileUploadControllerLogger = createControllerLogger("file-upload");

// ─── SCHEDULER JOB LOGGERS ─────────────────────────────────────────────────

export const workspaceCleanupJobLogger =
  createJobSchedulerLogger("workspace-cleanup");
export const yjsSnapshotJobLogger = createJobSchedulerLogger("yjs-snapshot");
export const notificationDueReminderJobLogger = createJobSchedulerLogger(
  "notification-due-reminder",
);
export const notificationDigestJobLogger = createJobSchedulerLogger(
  "notification-digest",
);
export const selfPingJobLogger = createJobSchedulerLogger("self-ping");

// ─── WEBSOCKET COMPONENT LOGGERS ───────────────────────────────────────────

export const websocketServerLogger = createWebsocketComponentLogger("server");
export const websocketBootstrapLogger =
  createWebsocketComponentLogger("bootstrap");
export const websocketAuthLogger =
  createWebsocketComponentLogger("authenticate");
export const websocketAuthorizeLogger =
  createWebsocketComponentLogger("authorize");
export const heartbeatLogger = createWebsocketComponentLogger("heartbeat");
export const connectionRegistryLogger = createWebsocketComponentLogger(
  "connection-registry",
);
export const messageHandlerLogger =
  createWebsocketComponentLogger("message-handler");
export const notificationSocketLogger = createWebsocketComponentLogger(
  "notification-socket",
);

// ─── COLLABORATION COMPONENT LOGGERS ───────────────────────────────────────

export const yjsLogger = createCollaborationComponentLogger("yjs");
export const awarenessLogger = createCollaborationComponentLogger("awareness");
export const syncLogger = createCollaborationComponentLogger("sync");
export const documentManagerLogger =
  createCollaborationComponentLogger("document-manager");
export const managedDocumentLogger =
  createCollaborationComponentLogger("managed-document");

// ─── NOTIFICATION DELIVERY LOGGERS ──────────────────────────────────────────

export const emailLogger = createDeliveryLogger("email");
export const smsLogger = createDeliveryLogger("sms");
export const pushLogger = createDeliveryLogger("push");
