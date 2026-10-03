import { ENV } from "../config/env";
import { selfPingJobLogger as log } from "../infrastructure/logging/childLogger";

const SELF_PING_TIMEOUT_MS = 10_000;

/** Path pinged on the service itself — the cheap liveness probe. */
const SELF_PING_PATH = "/healthz";

export async function selfPingJob(): Promise<void> {
  const baseUrl = ENV.SELF_PING_URL ?? ENV.RENDER_EXTERNAL_URL;

  if (!baseUrl) {
    log.debug(
      "No SELF_PING_URL or RENDER_EXTERNAL_URL configured — skipping self-ping.",
    );
    return;
  }

  const url = new URL(SELF_PING_PATH, baseUrl).toString();
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": "kanban-collab-self-ping" },
      signal: AbortSignal.timeout(SELF_PING_TIMEOUT_MS),
    });

    const durationMs = Date.now() - startedAt;

    if (response.ok) {
      log.info({ url, status: response.status, durationMs }, "Self-ping ok.");
    } else {
      // Reachable but unhealthy — the service is awake, which is what matters
      // here, so this is a warning rather than a failure.
      log.warn(
        { url, status: response.status, durationMs },
        "Self-ping returned a non-2xx status.",
      );
    }
  } catch (error) {
    log.error(
      { err: error, url, durationMs: Date.now() - startedAt },
      "Self-ping failed.",
    );
    throw error;
  }
}
