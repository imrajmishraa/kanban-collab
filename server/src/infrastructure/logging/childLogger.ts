import { logger } from "./logger";


// NAME REGISTRIES — types are derived from these, single source of truth

const CONTROLLER_NAMES = [
  "auth",
  "dashboard",
  "board",
  "workspace",
  "card",
  "column",
  "comment",
  "notification",
  "activity",
  "search",
  "file-upload",
] as const;

const WEBSOCKET_COMPONENTS = [
  "server",
  "bootstrap",
  "authenticate",
  "authorize",
  "heartbeat",
  "connection-registry",
  "message-handler",
  "notification-socket",
] as const;

const COLLABORATION_COMPONENTS = [
  "yjs",
  "awareness",
  "sync",
  "document-manager",
  "managed-document",
] as const;

const JOB_NAMES = [
  "workspace-cleanup",
  "yjs-snapshot",
  "notification-due-reminder",
  "notification-digest",
] as const;

const DELIVERY_CHANNELS = ["email", "sms", "push"] as const;

export type ControllerName = (typeof CONTROLLER_NAMES)[number];
export type WebsocketComponentName = (typeof WEBSOCKET_COMPONENTS)[number];
export type CollaborationComponentName =
  (typeof COLLABORATION_COMPONENTS)[number];
export type JobName = (typeof JOB_NAMES)[number];
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];


// MODULE-LEVEL LOGGERS — one per functional area

export const httpLogger = logger.child({ module: "http" });
export const authLogger = logger.child({ module: "auth" });
export const websocketLogger = logger.child({ module: "websocket" });
export const collaborationLogger = logger.child({ module: "collaboration" });
export const persistenceLogger = logger.child({ module: "persistence" });
export const databaseLogger = logger.child({ module: "database" });
export const securityLogger = logger.child({ module: "security" });
export const lifecycleLogger = logger.child({ module: "lifecycle" });
export const schedulerLogger = logger.child({ module: "cron" });

// ─── Subsystems added for the notification + scaling layers ─────────────────
export const redisLogger = logger.child({ module: "redis" });
export const notificationLogger = logger.child({ module: "notification" });
export const storageLogger = logger.child({ module: "storage" });
export const rateLimitLogger = logger.child({ module: "rate-limit" });


// FACTORIES — create child loggers with an extra scoping field

export const createControllerLogger = (controller: ControllerName) =>
  httpLogger.child({ controller });

export const createWebsocketComponentLogger = (
  component: WebsocketComponentName,
) => websocketLogger.child({ component });

export const createCollaborationComponentLogger = (
  component: CollaborationComponentName,
) => collaborationLogger.child({ component });

export const createJobSchedulerLogger = (job: JobName) =>
  schedulerLogger.child({ job });

export const createDeliveryLogger = (channel: DeliveryChannel) =>
  notificationLogger.child({ channel });


// HTTP CONTROLLER LOGGERS

export const authControllerLogger = createControllerLogger("auth");
export const dashboardControllerLogger = createControllerLogger("dashboard");
export const boardControllerLogger = createControllerLogger("board");
export const workspaceControllerLogger = createControllerLogger("workspace");
export const cardControllerLogger = createControllerLogger("card");
export const columnControllerLogger = createControllerLogger("column");
export const commentControllerLogger = createControllerLogger("comment");
export const notificationControllerLogger =
  createControllerLogger("notification");
export const activityControllerLogger = createControllerLogger("activity");
export const searchControllerLogger = createControllerLogger("search");
export const fileUploadControllerLogger = createControllerLogger("file-upload");


// SCHEDULER JOB LOGGERS

export const workspaceCleanupJobLogger =
  createJobSchedulerLogger("workspace-cleanup");
export const yjsSnapshotJobLogger = createJobSchedulerLogger("yjs-snapshot");
export const notificationDueReminderJobLogger = createJobSchedulerLogger(
  "notification-due-reminder",
);
export const notificationDigestJobLogger = createJobSchedulerLogger(
  "notification-digest",
);


// WEBSOCKET COMPONENT LOGGERS

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


// COLLABORATION COMPONENT LOGGERS


export const yjsLogger = createCollaborationComponentLogger("yjs");
export const awarenessLogger = createCollaborationComponentLogger("awareness");
export const syncLogger = createCollaborationComponentLogger("sync");
export const documentManagerLogger =
  createCollaborationComponentLogger("document-manager");
export const managedDocumentLogger =
  createCollaborationComponentLogger("managed-document");


// NOTIFICATION DELIVERY LOGGERS

export const emailLogger = createDeliveryLogger("email");
export const smsLogger = createDeliveryLogger("sms");
export const pushLogger = createDeliveryLogger("push");
