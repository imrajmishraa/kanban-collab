import type { CookieOptions } from "express";
import { ENV } from "../../../config/env";

const IS_PROD = ENV.NODE_ENV === "production";
export const SAME_SITE: CookieOptions["sameSite"] = IS_PROD ? "none" : "lax";

/**
 * Single source of truth for the `Secure` flag, so the refresh cookie and the
 * CSRF cookie (see middleware/csrf.middleware.ts) can never disagree.
 */
export const COOKIE_SECURE: boolean = ENV.COOKIE_SECURE;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_REFRESH_MAX_AGE = 7 * MS_PER_DAY; // 7d
export const REMEMBER_ME_MAX_AGE = 30 * MS_PER_DAY; // 30d

export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Cookie scope must cover every endpoint that needs to *read* the cookie
 * (login, logout, refresh), so use the parent path — not just /refresh.
 */
const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: SAME_SITE,
  path: "/api/v1/auth",
};

/**
 * Cookie options for the refresh token.
 *
 *   rememberMe = true  → persistent cookie, 30d
 *   rememberMe = false → session cookie (no maxAge → browser deletes on close)
 */
export function getRefreshCookieOptions(rememberMe: boolean): CookieOptions {
  return {
    ...BASE_COOKIE_OPTIONS,
    ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
  };
}

/**
 * Cookie options for clearing — path must match exactly or the browser
 * will keep the old cookie alive.
 */
export function clearRefreshCookieOptions(): CookieOptions {
  return { ...BASE_COOKIE_OPTIONS };
}
