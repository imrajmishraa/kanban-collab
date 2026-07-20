import "dotenv/config";

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  HOST: process.env.HOST ?? "localhost",
  NODE_ENV: process.env.NODE_ENV ?? "development",

  MONGODB_URI: getEnv("MONGODB_URI"),
  REDIS_URL: getEnv("REDIS_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
} as const;
