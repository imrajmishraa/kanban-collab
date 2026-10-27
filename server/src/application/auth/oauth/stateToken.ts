import crypto from "node:crypto";

import { ENV } from "../../../config/env";
import { invalidOAuthStateError } from "../../../shared/errors/auth/oauth";

/**
 * Self-verifying OAuth `state`.
 *
 * The state used to be a random token stored in a cookie scoped to
 * `/api/v1/auth/oauth`. That only works while the flow starts and ends on the
 * *same origin*: the cookie is written against whichever host served
 * `/auth/oauth/:provider`, and the provider redirects the browser to
 * `GOOGLE_REDIRECT_URI` / `GITHUB_REDIRECT_URI`, which may be a different host.
 * When the two differ the cookie is never sent back, `state` can never match,
 * and every attempt fails identically with `invalid_state`.
 *
 * Signing the state instead of storing it removes the origin from the equation:
 * the value carries everything needed to verify it, so it survives any host,
 * any redirect, and browsers that block third-party cookies.
 *
 * Format: `<base64url(payload)>.<base64url(hmac-sha256(payload))>`
 *
 * Replay note: a captured `code`+`state` pair could in principle be replayed,
 * but authorization codes are single-use at the provider, so the window is the
 * provider's, not ours. The TTL below bounds it further.
 */
const STATE_TTL_MS = 10 * 60 * 1000;

interface StatePayload {
  /** Provider the state was minted for — binds the callback to the right one. */
  p: string;
  /** Random nonce, so two states are never identical. */
  n: string;
  /** Issued-at, epoch ms. */
  t: number;
  /** rememberMe flag carried across the round trip (1 = on). */
  r: 0 | 1;
}

/**
 * HMAC key.
 *
 * `OAUTH_STATE_SECRET` is the intended value; falling back to `JWT_SECRET`
 * keeps existing deployments booting, and the `oauth-state:` prefix keeps the
 * derived key independent of the JWT signing keys.
 */
function hmacKey(): Buffer {
  const secret = ENV.OAUTH_STATE_SECRET ?? ENV.JWT_SECRET;

  return crypto.createHash("sha256").update(`oauth-state:${secret}`).digest();
}

function sign(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", hmacKey())
    .update(encodedPayload)
    .digest("base64url");
}

export function createStateToken(input: {
  provider: string;
  rememberMe: boolean;
}): string {
  const payload: StatePayload = {
    p: input.provider,
    n: crypto.randomBytes(16).toString("base64url"),
    t: Date.now(),
    r: input.rememberMe ? 1 : 0,
  };

  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encoded}.${sign(encoded)}`;
}

/**
 * Verifies signature, provider binding and age.
 *
 * Throws `invalidOAuthStateError()` for anything that does not check out — the
 * caller turns that into a redirect, never a 500.
 */
export function verifyStateToken(
  token: string,
  expectedProvider: string,
): { rememberMe: boolean } {
  const parts = token.split(".");

  if (parts.length !== 2) throw invalidOAuthStateError();

  const encoded = parts[0];
  const providedSignature = parts[1];

  if (!encoded || !providedSignature) throw invalidOAuthStateError();

  const expectedSignature = sign(encoded);

  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  // Length check first: timingSafeEqual throws on mismatched lengths.
  if (provided.length !== expected.length) throw invalidOAuthStateError();

  if (!crypto.timingSafeEqual(provided, expected)) {
    throw invalidOAuthStateError();
  }

  let payload: unknown;

  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    throw invalidOAuthStateError();
  }

  if (typeof payload !== "object" || payload === null) {
    throw invalidOAuthStateError();
  }

  const { p, t, r } = payload as Partial<StatePayload>;

  if (typeof p !== "string" || p !== expectedProvider) {
    throw invalidOAuthStateError();
  }

  if (typeof t !== "number" || !Number.isFinite(t)) {
    throw invalidOAuthStateError();
  }

  const age = Date.now() - t;

  // Reject both expired and clock-skewed (future) tokens.
  if (age < 0 || age > STATE_TTL_MS) throw invalidOAuthStateError();

  return { rememberMe: r === 1 };
}
