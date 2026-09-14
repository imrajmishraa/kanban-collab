import { z } from "zod";

// SHARED FIELD SCHEMAS

/** Lowercased + trimmed, ready to match User schema's `lowercase: true`. */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

/**
 * Password rules — keep these in sync with your auth policy.
 * Changing them requires updating `hashPassword` + client-side hints.
 */
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/**
 * Optional client metadata — sent by web and mobile apps for session tracking.
 * Stored on the Session row so users can see "where am I signed in" and
 * revoke devices individually.
 */
const deviceIdField = z
  .string()
  .trim()
  .min(1, "Device ID cannot be empty")
  .max(128, "Device ID is too long")
  .optional();

const platformField = z
  .enum(["web", "ios", "android", "desktop"], {
    error: "Platform must be one of: web, ios, android, desktop",
  })
  .optional();


// REGISTER

export const registerSchema = {
  body: z
    .object({
      email: emailField,
      password: passwordField,
      fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(80, "Full name must be at most 80 characters"),

      // Optional client metadata (harmless on web, useful for mobile)
      deviceId: deviceIdField,
      platform: platformField,
    })
    .strict(),
};


// LOGIN

export const loginSchema = {
  body: z
    .object({
      email: emailField,
      password: z.string().min(1, "Password is required"),
      rememberMe: z.boolean().optional().default(false),

      // Optional client metadata
      deviceId: deviceIdField,
      platform: platformField,
    })
    .strict(),
};


// REFRESH — reads from cookies, not body

/**
 * Refresh takes no body. The refresh token is in an httpOnly cookie,
 * which `cookie-parser` exposes via `req.cookies.refreshToken`.
 *
 * This schema exists only to reject requests that mistakenly send a body,
 * or to enforce the absence of extra fields if you want strictness.
 *
 * Not wired into the route today — the route skips validation entirely.
 * Kept here so the shape is documented alongside the other auth schemas.
 */
export const refreshTokenSchema = {
  body: z.object({}).strict().optional(),
};


// INFERRED TYPES (optional — for use in controller casts)

export type RegisterBody = z.infer<typeof registerSchema.body>;
export type LoginBody = z.infer<typeof loginSchema.body>;
