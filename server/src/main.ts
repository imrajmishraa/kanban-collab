import http from "node:http";

import { ENV } from "./config/env";
import {
  connectDB,
  disconnectDB,
} from "./infrastructure/db/mongoose/dbConnect";
import {
  getCacheClient,
  closeCacheClient,
} from "./infrastructure/cache/cacheClient";
import { startCronJobs, stopCronJobs } from "./infrastructure/scheduler/cron";
import { lifecycleLogger } from "./infrastructure/logging/childLogger";
import { app } from "./interfaces/http/app";
import {
  startWebSocketServer,
  stopWebSocketServer,
} from "./interfaces/websockets/server/server";


// STATE


let httpServer: http.Server | null = null;
let shuttingDown = false;

/** Max time to allow graceful shutdown before forcing exit. */
const SHUTDOWN_TIMEOUT_MS = 15_000;


// BOOTSTRAP

async function bootstrap(): Promise<void> {
  lifecycleLogger.info(
    { env: ENV.NODE_ENV, node: process.version },
    "Starting Kanban Collaboration Server…",
  );

  // ─── 1. Database ─────────────────────────────────────────────────────────
  await connectDB();

  // ─── 2. Cache (warm connection so failures surface at boot) ──────────────
  await getCacheClient();

  // ─── 3. HTTP server ──────────────────────────────────────────────────────
  httpServer = http.createServer(app);

  // ─── 4. WebSocket server (attaches to the same HTTP server) ──────────────
  await startWebSocketServer(httpServer);

  // ─── 5. Listen ───────────────────────────────────────────────────────────
  await new Promise<void>((resolve, reject) => {
    httpServer!.once("error", reject);

    httpServer!.listen(ENV.PORT, () => {
      httpServer!.off("error", reject);

      lifecycleLogger.info(
        { port: ENV.PORT, environment: ENV.NODE_ENV },
        "HTTP & WebSocket server listening.",
      );

      resolve();
    });
  });

  // ─── 6. Cron jobs (started AFTER listen so they don't fire during boot) ──
  startCronJobs();
}


// GRACEFUL SHUTDOWN

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    lifecycleLogger.warn({ signal }, "Shutdown already in progress.");
    return;
  }
  shuttingDown = true;

  lifecycleLogger.info({ signal }, "Graceful shutdown initiated.");

  // Force-exit safety net. If any step hangs, we exit with code 1 so the
  // orchestrator knows the shutdown was not clean.
  const forceExitTimer = setTimeout(() => {
    lifecycleLogger.fatal(
      { signal, timeoutMs: SHUTDOWN_TIMEOUT_MS },
      "Shutdown timed out — forcing exit.",
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  // Ensure the timer doesn't keep the event loop alive if we exit cleanly
  forceExitTimer.unref();

  try {
    // ─── 1. Stop accepting new work ────────────────────────────────────────
    stopCronJobs();

    // ─── 2. Close WebSocket server (stops Yjs + heartbeat + connections) ───
    await stopWebSocketServer();
    lifecycleLogger.info("WebSocket server stopped.");

    // ─── 3. Close HTTP server ──────────────────────────────────────────────
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err?: Error) => {
          if (err) return reject(err);
          resolve();
        });

        // Force-close keep-alive connections so close() actually completes.
        // Available since Node 18.2.
        if (typeof httpServer!.closeAllConnections === "function") {
          httpServer!.closeAllConnections();
        }
      });

      lifecycleLogger.info("HTTP server stopped.");
    }

    // ─── 4. Close cache connection ─────────────────────────────────────────
    await closeCacheClient();
    lifecycleLogger.info("Cache client closed.");

    // ─── 5. Disconnect MongoDB ─────────────────────────────────────────────
    await disconnectDB();

    // ─── 6. Clear force-exit timer — we made it ────────────────────────────
    clearTimeout(forceExitTimer);

    lifecycleLogger.info("Shutdown completed successfully.");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);

    lifecycleLogger.fatal({ err: error, signal }, "Shutdown failed.");
    process.exit(1);
  }
}


// PROCESS SIGNALS

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));


// FATAL ERROR HANDLERS

/**
 * Uncaught exception — the process is in an undefined state.
 * Log, then shut down as fast as possible.
 */
process.on("uncaughtException", (error) => {
  lifecycleLogger.fatal({ err: error }, "Uncaught exception — shutting down.");

  // If shutdown is already running, exit immediately — we can't recover.
  if (shuttingDown) process.exit(1);

  void shutdown("uncaughtException");
});

/**
 * Unhandled rejection — Node 15+ crashes by default.
 * Same treatment as uncaughtException.
 */
process.on("unhandledRejection", (reason) => {
  lifecycleLogger.fatal(
    { reason },
    "Unhandled promise rejection — shutting down.",
  );

  if (shuttingDown) process.exit(1);

  void shutdown("unhandledRejection");
});


// BOOT

void bootstrap().catch((error) => {
  lifecycleLogger.fatal({ err: error }, "Application bootstrap failed.");
  process.exit(1);
});
