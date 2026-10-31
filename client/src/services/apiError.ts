export interface ApiErrorField {
  field?: string;
  message: string;
  code?: string;
  location?: "body" | "params" | "query";
}

export interface ApiErrorResponse {
  /** HTTP status — mirrors the response status code. */
  statusCode: number;

  /** Envelope discriminator. Always `false` for errors. */
  success: false;

  /** Human-readable summary — main message shown to users. */
  message?: string;

  /** Machine-readable identifier — branch on this, not on `message`. */
  code?: string;

  /** Legacy single-error field. Kept for backwards compatibility. */
  error?: string;

  /** Field-level validation errors (from Zod on the server). */
  errors?: ApiErrorField[];

  /** Optional payload — extra context (e.g. `retryAfterSeconds`). */
  data?: unknown;
}
