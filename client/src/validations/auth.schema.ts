import { z } from "zod";

export const registerSchema = z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must not exceed 100 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    password: z.string().min(8, "Password must be at least 8 characters."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });


export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
