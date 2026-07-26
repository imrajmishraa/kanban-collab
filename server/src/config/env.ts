import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  WS_PORT: z.coerce.number().int().positive().default(1234),

  WS_MAX_PAYLOAD: z.coerce
    .number()
    .int()
    .positive()
    .default(1024 * 1024),

  HOST: z.string().default("localhost"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  ORIGIN_URL: z.url().default("http://localhost"),

  MONGODB_URI: z.string().min(1),

  REDIS_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),

  JWT_REFRESH_SECRET: z.string().min(1),

  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Invalid environment configuration:\n");

  for (const issue of parsed.error.issues) {
    console.error(`• ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

export const ENV = parsed.data;
