import "dotenv/config";

import { z } from "zod";

// HELPERS

const zBoolean = z.union([z.boolean(), z.string()]).transform((v) => {
  if (typeof v === "boolean") return v;
  return ["true", "1", "yes", "on"].includes(v.trim().toLowerCase());
});

const zCsv = z
  .string()
  .transform((v) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().min(1)));

const zCron = z
  .string()
  .regex(
    /^([*0-9,\-\/]+)\s+([*0-9,\-\/]+)\s+([*0-9,\-\/]+)\s+([*0-9,\-\/]+)\s+([*0-9,\-\/]+)$/,
    "Must be a valid 5-field cron expression",
  );

const zDuration = z
  .string()
  .regex(/^\d+(ms|s|m|h|d|w|y)?$/, "Duration must be like '15m', '7d', '30s'");

// SCHEMA

const envSchema = z.object({
  // Runtime
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default("localhost"),
  API_PREFIX: z.string().default("/api"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  // MongoDB
  MONGODB_URI: z.string().min(1),
  MONGO_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
  MONGO_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),
  MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(10_000),

  // Redis
  REDIS_URL: z.string().min(1),
  REDIS_KEY_PREFIX: z.string().default("kanban:"),
  REDIS_YJS_CHANNEL: z.string().default("kanban:yjs:updates"),
  REDIS_NOTIF_CHANNEL: z.string().default("kanban:notifications"),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: zDuration.default("15m"),
  JWT_REFRESH_EXPIRES_IN: zDuration.default("7d"),
  JWT_REFRESH_EXPIRES_IN_REMEMBER: zDuration.default("30d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().url().optional(),
  OAUTH_STATE_SECRET: z.string().min(32).optional(),
  OAUTH_STATE_COOKIE_NAME: z.string().default("oauth_state"),

  // CORS
  CLIENT_URL: z.url().default("http://localhost:5173"),
  CORS_ORIGINS: zCsv.prefault("http://localhost:5173,http://localhost:3000"),

  // WebSocket / Yjs
  WS_PATH: z.string().default("/ws"),
  WS_MAX_PAYLOAD: z.coerce
    .number()
    .int()
    .positive()
    .default(1024 * 1024),
  WS_HEARTBEAT_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  YJS_SNAPSHOT_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 60 * 1000),
  YJS_SNAPSHOT_DEBOUNCE_MS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(5_000),

  // Storage
  STORAGE_PROVIDER: z.enum(["local", "s3", "minio"]).default("local"),
  UPLOAD_DIR: z.string().default("./uploads"),
  UPLOAD_TEMP_DIR: z.string().default("./uploads/temp"),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(25),
  AWS_REGION: z.string().default("auto"),
  S3_ENDPOINT: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default(""),
  S3_PUBLIC_URL: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(["console", "ses", "smtp"]).default("console"),
  EMAIL_FROM: z.string().default("Kanban Collab <no-reply@localhost>"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: zBoolean.default(false),

  // SMS
  SMS_PROVIDER: z.enum(["console", "sns", "twilio"]).default("console"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  // Push
  PUSH_ENABLED: zBoolean.default(false),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:admin@localhost"),

  // Notifications
  NOTIF_DIGEST_CRON: zCron.default("0 8 * * *"),
  NOTIF_DUE_REMINDER_CRON: zCron.default("*/15 * * * *"),
  NOTIF_DUE_SOON_WINDOW_HOURS: z.coerce.number().int().positive().default(24),
  NOTIF_BATCH_SIZE: z.coerce.number().int().positive().default(200),
  NOTIF_TTL_READ_DAYS: z.coerce.number().int().positive().default(90),

  // Scheduler
  SCHEDULER_ENABLED: zBoolean.default(true),
  WORKSPACE_CLEANUP_CRON: zCron.default("0 * * * *"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Observability
  OTEL_ENABLED: zBoolean.default(false),
  OTEL_SERVICE_NAME: z.string().default("kanban-collab-server"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  PROMETHEUS_ENABLED: zBoolean.default(true),
  PROMETHEUS_PATH: z.string().default("/metrics"),

  // Security
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: zBoolean.optional(),
  TRUST_PROXY: zBoolean.optional(),
});

// PARSE

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const flat = z.flattenError(parsed.error);
  console.error("\n❌ Invalid environment configuration:\n");
  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    for (const message of messages ?? []) {
      console.error(`  • ${field}: ${message}`);
    }
  }
  for (const message of flat.formErrors) {
    console.error(`  • ${message}`);
  }
  process.exit(1);
}

const raw = parsed.data;

// CROSS-FIELD VALIDATION

const crossErrors: string[] = [];

if (raw.NODE_ENV === "production") {
  if (
    raw.JWT_SECRET.includes("change-me") ||
    raw.JWT_SECRET.includes("replace")
  ) {
    crossErrors.push("JWT_SECRET uses an insecure default in production");
  }
  if (
    raw.JWT_REFRESH_SECRET.includes("change-me") ||
    raw.JWT_REFRESH_SECRET.includes("replace")
  ) {
    crossErrors.push(
      "JWT_REFRESH_SECRET uses an insecure default in production",
    );
  }
  if (raw.JWT_SECRET === raw.JWT_REFRESH_SECRET) {
    crossErrors.push("JWT_SECRET and JWT_REFRESH_SECRET must be different");
  }
}

const googleParts = [
  raw.GOOGLE_CLIENT_ID,
  raw.GOOGLE_CLIENT_SECRET,
  raw.GOOGLE_REDIRECT_URI,
];
const googleConfigured = googleParts.filter(Boolean).length;
if (googleConfigured > 0 && googleConfigured < 3) {
  crossErrors.push(
    "Google OAuth requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI (all three or none)",
  );
}

const githubParts = [
  raw.GITHUB_CLIENT_ID,
  raw.GITHUB_CLIENT_SECRET,
  raw.GITHUB_REDIRECT_URI,
];
const githubConfigured = githubParts.filter(Boolean).length;
if (githubConfigured > 0 && githubConfigured < 3) {
  crossErrors.push(
    "GitHub OAuth requires GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_REDIRECT_URI (all three or none)",
  );
}

if (raw.EMAIL_PROVIDER === "smtp" && (!raw.SMTP_HOST || !raw.SMTP_USER)) {
  crossErrors.push("EMAIL_PROVIDER=smtp requires SMTP_HOST and SMTP_USER");
}

if (
  raw.SMS_PROVIDER === "twilio" &&
  (!raw.TWILIO_ACCOUNT_SID || !raw.TWILIO_AUTH_TOKEN)
) {
  crossErrors.push(
    "SMS_PROVIDER=twilio requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN",
  );
}

if (raw.PUSH_ENABLED && (!raw.VAPID_PUBLIC_KEY || !raw.VAPID_PRIVATE_KEY)) {
  crossErrors.push(
    "PUSH_ENABLED=true requires VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY",
  );
}

if (raw.STORAGE_PROVIDER !== "local" && !raw.S3_BUCKET_NAME) {
  crossErrors.push(
    `STORAGE_PROVIDER=${raw.STORAGE_PROVIDER} requires S3_BUCKET_NAME`,
  );
}

if (crossErrors.length > 0) {
  console.error("\n❌ Invalid environment configuration (cross-field):\n");
  for (const err of crossErrors) console.error(`  • ${err}`);
  process.exit(1);
}

// EXPORT

export const ENV = {
  ...raw,
  IS_PROD: raw.NODE_ENV === "production",
  IS_DEV: raw.NODE_ENV === "development",
  IS_TEST: raw.NODE_ENV === "test",
  COOKIE_SECURE: raw.COOKIE_SECURE ?? raw.NODE_ENV === "production",
  TRUST_PROXY: raw.TRUST_PROXY ?? raw.NODE_ENV === "production",
} as const;

export type Env = typeof ENV;
