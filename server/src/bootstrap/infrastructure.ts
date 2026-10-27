import { ENV } from "../config/env";
import { getCacheClient } from "../infrastructure/cache/cacheClient";
import { connectDB } from "../infrastructure/db/mongoose/dbConnect";
import { lifecycleLogger } from "../infrastructure/logging/childLogger";

/**
 * Memoized infrastructure bootstrap.
 *
 * Two entry points share this:
 *
 *   - `src/main.ts` — long-lived process (Docker Compose, Render web service)
 *   - `src/serverless/handler.ts` — Vercel Function, where there is no boot
 *     phase and every cold start must (re)connect before serving.
 *
 * The promise is memoized so concurrent requests on the same instance await
 * one connection attempt instead of opening a pool each. A failed attempt is
 * cleared so the next request retries rather than pinning the instance to a
 * permanent failure.
 */
let ready: Promise<void> | null = null;

export function ensureInfrastructure(): Promise<void> {
  if (!ready) {
    ready = (async (): Promise<void> => {
      lifecycleLogger.info(
        { env: ENV.NODE_ENV, node: process.version },
        "Initializing infrastructure…",
      );

      await connectDB();
      await getCacheClient();

      lifecycleLogger.info("Infrastructure ready.");
    })();
  }

  const pending = ready;

  return pending.catch((error: unknown) => {
    if (ready === pending) {
      ready = null;
    }

    throw error;
  });
}

/**
 * Test helper — drops the memoized promise so a suite can assert the
 * initialization path again.
 */
export function resetInfrastructure(): void {
  ready = null;
}
