class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean = false;
  public readonly errors: unknown[];
  public readonly data: unknown;
  public readonly isOperational: boolean = true;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    data: unknown = null,
    stack?: string,
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ApiError";

    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
