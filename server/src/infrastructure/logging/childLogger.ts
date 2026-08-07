import { logger } from "./logger";

export const httpLogger = logger.child({
  module: "http",
});

export const schedulerLogger = logger.child({
  module: "cron",
});

export const workspaceJobSchedulerLogger = schedulerLogger.child({
  job: "workspace"
})

export const boardControllerLogger = httpLogger.child({
  controller: "board",
});

export const workspaceControllerLogger = httpLogger.child({
  controller: "workspace",
});

export const cardControllerLogger = httpLogger.child({
  controller: "card",
});

export const columnControllerLogger = httpLogger.child({
  controller: "column",
});

export const searchControllerLogger = httpLogger.child({
    controller: "search"
});

export const fileUploadControllerLogger = httpLogger.child({
    controller: "file upload"
})

export const authLogger = logger.child({
  module: "auth",
});

export const websocketLogger = logger.child({
  module: "websocket",
});

export const collaborationLogger = logger.child({
  module: "collaboration",
});

export const persistenceLogger = logger.child({
  module: "persistence",
});

export const databaseLogger = logger.child({
  module: "database",
});

export const securityLogger = logger.child({
  module: "security",
});

export const lifecycleLogger = logger.child({
  module: "lifecycle",
});

export const websocketServerLogger = websocketLogger.child({
  component: "server",
});

export const websocketAuthLogger = websocketLogger.child({
  component: "authenticate",
});

export const heartbeatLogger = websocketLogger.child({
  component: "heartbeat",
});

export const yjsLogger = collaborationLogger.child({
  component: "yjs",
});

export const awarenessLogger = collaborationLogger.child({
  component: "awareness",
});

export const syncLogger = collaborationLogger.child({
  component: "sync",
});