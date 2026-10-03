import type { ApiError } from "./ApiError";

class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly success: true;
  public readonly message: string;
  public readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    if (statusCode < 200 || statusCode >= 400) {
      // Fail fast during development — a "success" response with an error
      // status is almost always a controller bug.
      throw new Error(
        `ApiResponse must be constructed with a 2xx or 3xx status code (received ${statusCode}). ` +
          `Use ApiError + the global error handler for error responses.`,
      );
    }

    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
  }

  /** 200 OK — the common case. */
  static ok<T>(message: string, data: T) {
    return new ApiResponse(200, message, data);
  }

  /** 201 Created — resource-creating endpoints. */
  static created<T>(message: string, data: T) {
    return new ApiResponse(201, message, data);
  }
}

/**
 * Anything a route's response can be: the success envelope or the error
 * envelope. Narrow with `if (envelope.success) { … }`.
 */
type ApiEnvelope<T = unknown> = ApiResponse<T> | ApiError;

export { ApiResponse };
export type { ApiEnvelope };
