import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { ENV } from "../../../config/env";
import { ApiError } from "../../../shared/utils/ApiError";
import { securityLogger } from "../../../infrastructure/logging/childLogger";

/**
 * CSRF protection — double-submit cookie.
 *
 * The app authenticates with a Bearer access token, but the refresh token
 * lives in an httpOnly cookie and is sent automatically. Any state-changing
 * endpoint that can be reached with ambient cookie credentials is therefore
 * CSRF-exposed. This implements the standard double-submit pattern:
 *
 *   1. `issueCsrfCookie` guarantees a readable `csrf_token` cookie exists.
 *   2. `csrfProtection` requires that same value in the `X-CSRF-Token`
 *      header on every unsafe method (POST/PUT/PATCH/DELETE).
 *
 * Credential-establishing endpoints (login, register, password reset, OAuth)
 * carry no ambient authority, so they are exempt — otherwise a first-time
 * visitor, who has no cookie yet, could never log in.
 */

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Paths (prefix match) that don't rely on ambient cookie credentials. */
const EXEMPT_PREFIXES = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/oauth",
  "/healthz",
  "/readyz",
];

function isExempt(path: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Ensure every client has a CSRF cookie to echo back. */
export function issueCsrfCookie(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing = (req.cookies as Record<string, string> | undefined)?.[
    CSRF_COOKIE
  ];

  if (!existing) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // the client must read it to echo it back
      sameSite: "lax",
      secure: ENV.COOKIE_SECURE,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30, // keep it aligned with the refresh cookie
    });
  }

  next();
}

/** Enforce the double-submit check on unsafe methods. */
export function csrfProtection(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method) || isExempt(req.originalUrl)) {
    next();
    return;
  }

  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[
    CSRF_COOKIE
  ];
  const headerValue = req.headers[CSRF_HEADER];
  const headerToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (
    !cookieToken ||
    !headerToken ||
    !timingSafeEqual(cookieToken, headerToken)
  ) {
    securityLogger.warn(
      {
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
        hasCookie: Boolean(cookieToken),
        hasHeader: Boolean(headerToken),
      },
      "CSRF validation failed",
    );
    next(
      ApiError.forbidden(
        "Invalid or missing CSRF token. Refresh the page and try again.",
      ),
    );
    return;
  }

  next();
}
