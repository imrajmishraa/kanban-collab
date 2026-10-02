import z from "zod";

export const registerSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Fullname must be at least 2 characters"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
};

export const refreshTokenSchema = {
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
};
