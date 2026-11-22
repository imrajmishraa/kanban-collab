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
// 15-minute TTL to comfortably accommodate slower user consent decisions.
export const STATE_TTL_MS = 15 * 60 * 1000;
// Allow up to 60s clock drift between distributed servers/containers.
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

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

export interface CreatedState {
  token: string;
  /**
   * The nonce inside the token, returned so the caller can also put it in a
   * cookie. The token alone is portable — anybody who reads it can replay it —
   * so the cookie is what ties the round trip to one browser.
   */
  nonce: string;
}

export function createStateToken(input: {
  provider: string;
  rememberMe: boolean;
}): CreatedState {
  const nonce = crypto.randomBytes(16).toString("base64url");

  const payload: StatePayload = {
    p: input.provider,
    n: nonce,
    t: Date.now(),
    r: input.rememberMe ? 1 : 0,
  };

  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return { token: `${encoded}.${sign(encoded)}`, nonce };
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
): { rememberMe: boolean; nonce: string } {
  const parts = token.split(".");

  if (parts.length !== 2) throw invalidOAuthStateError("malformed");

  const encoded = parts[0];
  const providedSignature = parts[1];

  if (!encoded || !providedSignature) throw invalidOAuthStateError("malformed");

  const expectedSignature = sign(encoded);

  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  // Length check first: timingSafeEqual throws on mismatched lengths.
  if (provided.length !== expected.length) {
    throw invalidOAuthStateError("signature_mismatch");
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    throw invalidOAuthStateError("signature_mismatch");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    throw invalidOAuthStateError("unparseable");
  }

  if (typeof payload !== "object" || payload === null) {
    throw invalidOAuthStateError("unparseable");
  }

  const { p, t, r, n } = payload as Partial<StatePayload>;

  if (typeof p !== "string" || p !== expectedProvider) {
    throw invalidOAuthStateError("provider_mismatch");
  }

  if (typeof t !== "number" || !Number.isFinite(t)) {
    throw invalidOAuthStateError("bad_timestamp");
  }

  const age = Date.now() - t;

  // Reject both expired tokens and tokens with unrealistic future timestamps beyond allowed clock skew.
  if (age < -CLOCK_SKEW_TOLERANCE_MS || age > STATE_TTL_MS) {
    throw invalidOAuthStateError(age > STATE_TTL_MS ? "expired" : "future");
  }

  if (typeof n !== "string" || n.length === 0) {
    throw invalidOAuthStateError("missing_nonce");
  }

  return { rememberMe: r === 1, nonce: n };
}

/**
 * Does the state belong to the browser that presented it?
 *
 * The signed token says "this flow was minted by our server"; it says nothing
 * about *whose browser* is finishing it. An attacker who starts a flow, keeps
 * the `code`+`state` pair and sends the callback URL to somebody else gets that
 * person signed into the attacker's account — the classic login CSRF. The
 * nonce is written to a cookie when the flow starts, so a state that arrives
 * without its matching cookie did not start here.
 *
 * Both halves are base64url of 16 random bytes, so a plain comparison is fine —
 * the value is not a secret being guessed, it is a value being matched.
 */
export function stateMatchesBrowser(
  stateNonce: string,
  cookieNonce: string | undefined,
): boolean {
  return cookieNonce !== undefined && cookieNonce === stateNonce;
}
