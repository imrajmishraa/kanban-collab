// server/src/interfaces/http/controllers/health/healthz.ts
import mongoose from "mongoose";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { isCacheHealthy } from "../../../../infrastructure/cache/cacheClient";
import { httpLogger } from "../../../../infrastructure/logging/childLogger";
import { ENV } from "../../../../config/env";

// LIVENESS — "is this process alive?"

/**
 * GET /healthz
 *
 * Kubernetes / load balancer liveness probe.
 * Returns 200 as long as the process is running. Does NOT check dependencies —
 * a failed DB connection should NOT cause the orchestrator to restart the pod,
 * or you'd get crash-loops during a DB outage.
 *
 * For dependency checks, use `/readyz`.
 */
export const healthz = asyncHandler(async (_req, res) => {
  httpLogger.debug("Liveness probe.");

  return res.status(200).json(
    new ApiResponse(200, "Health check passed.", {
      data: {
        status: "UP",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        env: ENV.NODE_ENV,
      },
    }),
  );
});


// READINESS — "can this process serve traffic?"

/**
 * GET /readyz
 *
 * Readiness probe — checks that every dependency this process needs is
 * actually reachable. If any dependency is down, the orchestrator should
 * route traffic elsewhere (but NOT restart this pod).
 *
 * Returns 200 when everything is healthy, 503 when any dependency fails.
 */
export const readyz = asyncHandler(async (_req, res) => {
  const checks: Record<string, { status: "up" | "down"; detail?: string }> = {};

  // ── MongoDB ──────────────────────────────────────────────────────────────
  const mongoReady = mongoose.connection.readyState === 1;
  checks.mongo = {
    status: mongoReady ? "up" : "down",
    detail: mongoReady
      ? undefined
      : `readyState=${mongoose.connection.readyState}`,
  };

  // ── Redis (cache) ────────────────────────────────────────────────────────
  const redisReady = await isCacheHealthy();
  checks.redis = {
    status: redisReady ? "up" : "down",
  };

  const allUp = Object.values(checks).every((c) => c.status === "up");
  const statusCode = allUp ? 200 : 503;

  if (!allUp) {
    httpLogger.warn({ checks }, "Readiness probe failed.");
  }

  return res.status(statusCode).json(
    new ApiResponse(statusCode, allUp ? "Ready." : "Not ready.", {
      data: {
        status: allUp ? "UP" : "DOWN",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        env: ENV.NODE_ENV,
        checks,
      },
    }),
  );
});
