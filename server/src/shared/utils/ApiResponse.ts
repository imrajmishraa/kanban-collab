
/**
 * Standard success response envelope returned by every HTTP controller.
 *
 *   {
 *     statusCode: 200,
 *     success: true,
 *     message: "User logged in successfully.",
 *     data: { accessToken, user }
 *   }
 *
 * Error responses use `ApiError` + the global error handler, which produce
 * a shape-consistent envelope with `success: false`.
 */
class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly success: boolean;
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
}

export { ApiResponse };
