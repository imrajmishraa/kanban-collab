import mongoose, { type Mongoose } from "mongoose";

import { ENV } from "../../../config/env";
import { databaseLogger as log } from "../../logging/childLogger";
import { DB_NAME } from "../../../shared/constants/DB";

/** Strip the credentials from a Mongo URI before logging. */
function redactMongoUri(uri: string): string {
  // mongodb+srv://user:pass@host/db → mongodb+srv://***@host/db
  return uri.replace(/\/\/[^@]+@/, "//***@");
}

/** Register connection lifecycle listeners exactly once. */
let listenersRegistered = false;

function registerConnectionListeners(): void {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on("connected", () => {
    log.info({ host: mongoose.connection.host }, "MongoDB connected.");
  });

  mongoose.connection.on("error", (err) => {
    log.error({ err }, "MongoDB connection error.");
  });

  mongoose.connection.on("disconnected", () => {
    log.warn("MongoDB disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    log.info("MongoDB reconnected.");
  });
}

/**
 * Connect to MongoDB with retry on transient startup failures.
 *
 * - Uses pool sizes from ENV (falls back to sane defaults)
 * - Never logs credentials
 * - Does NOT call process.exit — the caller decides whether to abort boot
 * - Registers lifecycle listeners exactly once
 */
export async function connectDB(): Promise<Mongoose> {
  const uri = ENV.MONGODB_URI;
  const safeUri = redactMongoUri(uri);

  log.info({ uri: safeUri, dbName: DB_NAME }, "Connecting to MongoDB…");

  mongoose.set("strictQuery", true);

  const options: mongoose.ConnectOptions = {
    dbName: DB_NAME,
    maxPoolSize: ENV.MONGO_MAX_POOL_SIZE,
    minPoolSize: ENV.MONGO_MIN_POOL_SIZE,
    serverSelectionTimeoutMS: ENV.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: 60_000,
    connectTimeoutMS: 30_000,
    // Fail fast in dev so you see errors immediately
    heartbeatFrequencyMS: ENV.IS_PROD ? 10_000 : 5_000,
  };

  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY_MS = 3_000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const conn = await mongoose.connect(uri, options);

      registerConnectionListeners();

      log.info(
        {
          host: conn.connection.host,
          dbName: conn.connection.name,
          attempt,
        },
        "MongoDB connected.",
      );

      return conn;
    } catch (error) {
      lastError = error;

      log.error(
        {
          err: error,
          attempt,
          maxAttempts: MAX_ATTEMPTS,
        },
        "MongoDB connection attempt failed.",
      );

      if (attempt < MAX_ATTEMPTS) {
        const wait = RETRY_DELAY_MS * attempt; // linear backoff
        log.warn({ waitMs: wait }, "Retrying MongoDB connection…");
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  // All attempts exhausted — propagate so main.ts can decide what to do.
  log.fatal(
    { err: lastError, maxAttempts: MAX_ATTEMPTS },
    "MongoDB connection failed after all retries — aborting.",
  );

  throw lastError instanceof Error
    ? lastError
    : new Error("MongoDB connection failed");
}

/**
 * Gracefully close the Mongo connection.
 * Wire into SIGTERM/SIGINT in `main.ts`.
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close(false);
    log.info("MongoDB connection closed.");
  } catch (error) {
    log.error({ err: error }, "Error closing MongoDB connection.");
  }
}

export default connectDB;
