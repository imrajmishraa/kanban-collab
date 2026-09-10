import { logger } from "./logger";

type ControllerName =
  | "dashboard"
  | "board"
  | "workspace"
  | "card"
  | "column"
  | "search"
  | "file upload";

type WebsocketComponentName = "server" | "authenticate" | "heartbeat";

type CollaborationComponentName = "yjs" | "awareness" | "sync";

type JobName = "workspace";  


// Module-level loggers (one per functional area)
export const httpLogger = logger.child({ module: "http" });
export const schedulerLogger = logger.child({ module: "cron" });
export const authLogger = logger.child({ module: "auth" });
export const websocketLogger = logger.child({ module: "websocket" });
export const collaborationLogger = logger.child({ module: "collaboration" });
export const persistenceLogger = logger.child({ module: "persistence" });
export const databaseLogger = logger.child({ module: "database" });
export const securityLogger = logger.child({ module: "security" });
export const lifecycleLogger = logger.child({ module: "lifecycle" });


// Factory functions for common sub‑logger patterns

const createControllerLogger = (controller: ControllerName) =>
  httpLogger.child({ controller });

const createWebsocketComponentLogger = (component: WebsocketComponentName) =>
  websocketLogger.child({ component });

const createCollaborationComponentLogger = (component: CollaborationComponentName) =>
  collaborationLogger.child({ component });

const createJobSchedulerLogger = (job: JobName) =>
  schedulerLogger.child({ job });


// HTTP controller loggers

export const dashboardControllerLogger = createControllerLogger("dashboard");
export const boardControllerLogger = createControllerLogger("board");
export const workspaceControllerLogger = createControllerLogger("workspace");
export const cardControllerLogger = createControllerLogger("card");
export const columnControllerLogger = createControllerLogger("column");
export const searchControllerLogger = createControllerLogger("search");
export const fileUploadControllerLogger = createControllerLogger("file upload");


// Scheduler job loggers
export const workspaceJobSchedulerLogger = createJobSchedulerLogger("workspace");


// WebSocket component loggers

export const websocketServerLogger = createWebsocketComponentLogger("server");
export const websocketAuthLogger = createWebsocketComponentLogger("authenticate");
export const heartbeatLogger = createWebsocketComponentLogger("heartbeat");


// Collaboration component loggers

export const yjsLogger = createCollaborationComponentLogger("yjs");
export const awarenessLogger = createCollaborationComponentLogger("awareness");
export const syncLogger = createCollaborationComponentLogger("sync");