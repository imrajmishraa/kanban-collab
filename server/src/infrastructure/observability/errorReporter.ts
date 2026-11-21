/**
 * Error reporting without an SDK.
 *
 * The repo has no error tracker, and the cost showed up twice this month: a
 * Vercel deployment failed five separate ways and every one was found by
 * pasting build logs into a chat, and a 500 in production leaves a line in the
 * host's log that nobody reads.
 *
 * This is the smallest thing that closes that gap: one compact JSON document per
 * failure, POSTed to a URL from the environment. A Slack/Discord webhook, a
 * collector, or an n8n flow all accept it; swapping in `@sentry/node` later is
 * the body of `deliver()` and nothing else.
 *
 * Three rules, because a reporter that misbehaves is worse than none:
 *
 *   1. It never throws. Reporting is a side effect of failing, and failing to
 *      report must not fail the request.
 *   2. It is inert without `ERROR_WEBHOOK_URL`. No config, no traffic, no
 *      surprise in local dev or in tests.
 *   3. It rate-limits itself. A loop that throws on every request would
 *      otherwise POST thousands of identical documents and take the process
 *      down with it.
 */

export interface ErrorContext {
  /** Where it happened: `http`, `uncaughtException`, `unhandledRejection`. */
  source: string;
  method?: string | undefined;
  url?: string | undefined;
  requestId?: string | undefined;
  statusCode?: number | undefined;
  code?: string | undefined;
  /** Anything else worth having: user id, board id, session id. */
  extra?: Record<string, unknown> | undefined;
}

export interface ErrorReport {
  /** ISO timestamp — the receiver sorts by this. */
  at: string;
  source: string;
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  method?: string;
  url?: string;
  requestId?: string;
  release?: string;
  environment?: string;
  /** Trimmed to `STACK_LIMIT` lines: the top of a stack is the useful part. */
  stack?: string;
  extra?: Record<string, unknown>;
}

const STACK_LIMIT = 20;

/** Errors are not always `Error` — a rejection can be a string or a plain object. */
function describe(error: unknown): {
  name: string;
  message: string;
  stack: string | undefined;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return { name: "Error", message: error, stack: undefined };
  }

  try {
    return { name: "Error", message: JSON.stringify(error), stack: undefined };
  } catch {
    return { name: "Error", message: String(error), stack: undefined };
  }
}

/** Build the document that goes over the wire. Pure — this is the tested part. */
export function buildErrorReport(
  error: unknown,
  context: ErrorContext,
  meta: {
    now?: Date;
    release?: string | undefined;
    environment?: string | undefined;
  } = {},
): ErrorReport {
  const { name, message, stack } = describe(error);
  const now = meta.now ?? new Date();

  const report: ErrorReport = {
    at: now.toISOString(),
    source: context.source,
    name,
    message,
  };

  if (context.code) report.code = context.code;
  if (context.statusCode !== undefined) report.statusCode = context.statusCode;
  if (context.method) report.method = context.method;
  if (context.url) report.url = context.url;
  if (context.requestId) report.requestId = context.requestId;
  if (meta.release) report.release = meta.release;
  if (meta.environment) report.environment = meta.environment;
  if (context.extra && Object.keys(context.extra).length > 0) {
    report.extra = context.extra;
  }

  if (stack) {
    report.stack = stack.split("\n").slice(0, STACK_LIMIT).join("\n");
  }

  return report;
}

/**
 * A token bucket, so a request loop cannot become a webhook flood.
 *
 * Ten reports per minute is enough to see that something is wrong and small
 * enough to stay polite to whatever is receiving them.
 */
export function createRateLimiter(
  limit = 10,
  windowMs = 60_000,
): (now?: Date) => boolean {
  let windowStart = 0;
  let used = 0;

  return (now = new Date()): boolean => {
    const time = now.getTime();

    if (time - windowStart >= windowMs) {
      windowStart = time;
      used = 0;
    }

    if (used >= limit) return false;

    used += 1;

    return true;
  };
}

export interface ReporterOptions {
  url?: string | undefined;
  release?: string | undefined;
  environment?: string | undefined;
  /** Injected in tests. */
  fetchImpl?: typeof fetch;
  allow?: (now?: Date) => boolean;
}

export interface ErrorReporter {
  /** Fire-and-forget: resolves even when delivery fails. */
  report: (error: unknown, context: ErrorContext) => Promise<void>;
  /** True when a URL is configured — callers skip the work otherwise. */
  enabled: boolean;
}

export function createErrorReporter(
  options: ReporterOptions = {},
): ErrorReporter {
  const {
    url,
    release,
    environment,
    fetchImpl = globalThis.fetch,
    allow = createRateLimiter(),
  } = options;

  const enabled = Boolean(url);

  async function deliver(report: ErrorReport): Promise<void> {
    if (!url) return;

    /* A hung receiver must not hold a request open. Three seconds, then give
       up — the log line already exists, this is the copy for humans. */
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3_000);

    try {
      await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(report),
        signal: controller.signal,
      });
    } catch {
      /* Swallowed on purpose — see rule 1 at the top of the file. */
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    enabled,
    async report(error, context) {
      if (!enabled) return;
      if (!allow()) return;

      await deliver(buildErrorReport(error, context, { release, environment }));
    },
  };
}
