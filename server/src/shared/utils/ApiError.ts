export interface ApiErrorOptions {
  errors?: unknown[];
  data?: unknown;
  code?: string;
  stack?: string;
  cause?: unknown;
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
    // Symmetric with ApiResponse's guard: an "error" response carrying a 2xx
    // status (or a nonsense one) is a controller bug — fail fast.
    if (statusCode < 400 || statusCode >= 600) {
      throw new Error(
        `ApiError must be constructed with a 4xx or 5xx status code (received ${statusCode}). ` +
          `Use ApiResponse for success responses.`,
      );
    }

    super(
      message,
      options.cause !== undefined ? { cause: options.cause } : undefined,
    );

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

  // ── Common cases, so call sites read declaratively ────────────────
  // new ApiError(HTTP_STATUS.BAD_REQUEST, "…")  →  ApiError.badRequest("…")

  static badRequest(message: string, options?: ApiErrorOptions) {
    return new ApiError(400, message, options);
  }

  static unauthorized(message: string, options?: ApiErrorOptions) {
    return new ApiError(401, message, options);
  }

  static forbidden(message: string, options?: ApiErrorOptions) {
    return new ApiError(403, message, options);
  }

  static notFound(message: string, options?: ApiErrorOptions) {
    return new ApiError(404, message, options);
  }

  static conflict(message: string, options?: ApiErrorOptions) {
    return new ApiError(409, message, options);
  }

  static tooManyRequests(message: string, options?: ApiErrorOptions) {
    return new ApiError(429, message, options);
  }

  static internal(
    message = "Internal server error",
    options?: ApiErrorOptions,
  ) {
    return new ApiError(500, message, { isOperational: false, ...options });
  }

  
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof Error) {
      return new ApiError(500, error.message, {
        cause: error,
        stack: error.stack,
        isOperational: false,
      });
    }

    return new ApiError(500, "Something went wrong", {
      data: error,
      isOperational: false,
    });
  }
}
