import "dotenv/config";
import { missingEnvVariable, invalidEnvVariable } from "../shared/errors/handler/env";

function getEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw missingEnvVariable(name);
  }

  return value;
}

function getNumberEnv(name: string): number {
  const value = getEnv(name);
  const number = Number(value);

  if (Number.isNaN(number)) {
    throw invalidEnvVariable(name, value);
  }

  return number;
}


export const ENV = {
  PORT: process.env.PORT || getNumberEnv("PORT") || 5000,
  WS_PORT: process.env.WS_PORT ||getNumberEnv('WS_PORT') ||123,
  HOST: process.env.HOST ?? "localhost",
  NODE_ENV: process.env.NODE_ENV ?? "development",

  MONGODB_URI: getEnv("MONGODB_URI"),
  REDIS_URL: getEnv("REDIS_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  LOG_LEVEL: getEnv("LOG_LEVEL")
} as const;
