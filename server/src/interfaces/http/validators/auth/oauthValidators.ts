import { z } from "zod";

export const oauthProviderParamSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1, "Missing authorization code."),
  state: z.string().min(1, "Missing state parameter."),
});
