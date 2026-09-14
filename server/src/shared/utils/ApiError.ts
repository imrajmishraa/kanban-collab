export interface ApiErrorOptions {
  /** Array of detailed errors — usually Zod issue arrays or field-level messages. */
  errors?: unknown[];

  /** Arbitrary payload to send alongside the error (rarely used). */
  data?: unknown;

  /**
   * Machine-readable code for client-side branching.
   * Example: "ACCESS_TOKEN_EXPIRED" → client refreshes silently.
   * Keep these in sync with `ERROR_CODE` constants.
   */
  code?: string;

  /**
   * Preserve the original stack when wrapping a lower-level error.
   * If omitted, `Error.captureStackTrace` produces a fresh stack.
   */
  stack?: string;

  /**
   * Whether this error is a known/expected condition (true) or an
   * unexpected crash that should page on-call (false).
   * The error handler logs both but can alert only on non-operational ones.
   */
  isOperational?: boolean;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: false;
  public readonly errors: unknown[];
  public readonly data: unknown;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    options: ApiErrorOptions = {},
  ) {
    super(message);

    // Restore the correct prototype for `instanceof ApiError` to work
    // after TypeScript's `extends Error` transpilation.
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.errors = options.errors ?? [];
    this.data = options.data ?? null;
    this.code = options.code;
    this.isOperational = options.isOperational ?? true;

    if (options.stack) {
      this.stack = options.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
