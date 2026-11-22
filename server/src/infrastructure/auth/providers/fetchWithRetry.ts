import { setTimeout as sleep } from "node:timers/promises";

/**
 * How long a provider gets before the request is abandoned.
 *
 * Without it a stuck connection holds the request (and its socket) until the
 * platform gives up, which on a serverless host is the whole invocation budget.
 */
const PROVIDER_TIMEOUT_MS = 8_000;

export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
}

/**
 * Resilient fetch wrapper for external OAuth APIs.
 * Automatically retries transient network blips or 5xx server errors.
 */
export async function fetchWithRetry(
  url: string | URL,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retries = 2, backoffMs = 300, ...fetchOptions } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });

      // Return immediately if successful or client-side error (4xx should not be retried)
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }

      // If 5xx, wait and retry
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError;
}
