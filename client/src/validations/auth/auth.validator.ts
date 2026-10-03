import { z } from "zod";

/* ── Shared limits ───────────────────────────────────────── */

export const FULL_NAME_MIN = 2;
export const FULL_NAME_MAX = 100;
export const PASSWORD_MIN = 8;

/* ── Register ────────────────────────────────────────────── */

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(FULL_NAME_MIN, "Full name must be at least 2 characters.")
      .max(FULL_NAME_MAX, "Full name must not exceed 100 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    password: z
      .string()
      .min(PASSWORD_MIN, "Password must be at least 8 characters."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/* ── Login ───────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

/* ── Forgot password ─────────────────────────────────────── */

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

/* ── Inferred types ──────────────────────────────────────── */

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
