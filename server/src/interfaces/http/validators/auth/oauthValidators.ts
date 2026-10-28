import { z } from "zod";

export const oauthProviderParamSchema = z.object({
  provider: z.enum(["google", "github"]),
});

/**
 * Callback query.
 *
 * Everything is optional because the provider may send `error` instead of
 * `code` (the user cancelled, or the app was misconfigured). Requiring `code`
 * here meant a cancelled consent screen produced a raw 400 JSON error instead
 * of sending the user back to the app's login page.
 */
export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
  error_description: z.string().min(1).optional(),
});

export const googleFederatedAuthSchema = z.object({
  credential: z.string().min(1),
  rememberMe: z.boolean().optional(),
});
