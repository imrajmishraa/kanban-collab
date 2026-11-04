/**
 * Boot the server one step at a time, printing the error instead of losing it.
 *
 * `src/main.ts` logs every failure through pino and calls `process.exit(1)` on
 * the next line. In development pino writes through a worker thread, so the log
 * line is discarded before it reaches your terminal and nodemon only reports
 * "app crashed". This script runs the same steps in the same order with plain
 * `console.error`, so the real failure surfaces with a stack trace.
 *
 * Place at `server/scripts/debug-boot.ts` and run from `server/`:
 *
 *   npx ts-node --files scripts/debug-boot.ts
 *
 * It stops at the first step that fails, which is the one you want.
 */
import "dotenv/config";

import http from "node:http";

import { ENV } from "../src/config/env";
import {
  connectDB,
  disconnectDB,
} from "../src/infrastructure/db/mongoose/dbConnect";
import {
  closeCacheClient,
  getCacheClient,
} from "../src/infrastructure/cache/cacheClient";
import { app } from "../src/interfaces/http/app";
import {
  startCronJobs,
  stopCronJobs,
} from "../src/infrastructure/scheduler/cron";
import {
  startWebSocketServer,
  stopWebSocketServer,
} from "../src/interfaces/websockets/server/server";

const PORT = ENV.PORT || 10000;

/** Strip credentials before printing a connection string. */
const redact = (value: string): string => value.replace(/\/\/[^@]+@/, "//***@");

async function step(name: string, run: () => Promise<void>): Promise<void> {
  process.stdout.write(`\n> ${name} ... `);
  const startedAt = Date.now();

  try {
    await run();
    console.log(`ok (${Date.now() - startedAt}ms)`);
  } catch (error) {
    console.log(`FAILED after ${Date.now() - startedAt}ms\n`);
    console.error(error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log("node    ", process.version);
  console.log("cwd     ", process.cwd());
  console.log(
    "env file",
    process.env["DOTENV_CONFIG_PATH"] ?? ".env (default)",
  );
  console.log("mode    ", ENV.NODE_ENV);
  console.log("port    ", PORT);
  console.log("mongo   ", redact(ENV.MONGODB_URI));
  console.log("redis   ", redact(ENV.REDIS_URL));

  await step("1. mongo connect", async () => {
    await connectDB();
    await disconnectDB();
  });

  await step("2. redis cache (falls back to noop, cannot fail)", async () => {
    await getCacheClient();
    await closeCacheClient();
  });

  await step("3. express app imports", async () => {
    if (!app) throw new Error("app did not export");
  });

  await step("4. websocket layer", async () => {
    const server = http.createServer(app);
    await startWebSocketServer(server);
    await stopWebSocketServer();
  });

  await step(`5. bind port ${PORT}`, async () => {
    const server = http.createServer(app);

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(PORT, () => {
        server.off("error", reject);
        server.close(() => resolve());
      });
    });
  });

  await step("6. cron jobs", async () => {
    startCronJobs();
    await stopCronJobs();
  });

  console.log("\nEvery boot step passed. The crash is in main.ts itself.\n");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
