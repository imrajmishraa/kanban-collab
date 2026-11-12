import {
  signInWithProvider,
  type SignInWithProviderResult,
} from "../providers/signInWithProvider";
import { unknownProviderError } from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "../../../infrastructure/auth/providers/types";
import type { Platform } from "../../../infrastructure/db/mongoose/schemas";
import { verifyGoogleIdToken } from "../../../infrastructure/auth/providers/googleTokenVerifier";
import { GithubProvider } from "../../../infrastructure/auth/providers/github/GithubProvider";

export interface VerifyOAuthInput {
  provider: "google" | "github";
  /** A Google ID token (JWT), or a GitHub authorisation code. */
  token: string;
  redirectUri?: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
}

/** One instance: it holds no state, only the client ids it was built with. */
const github = new GithubProvider();

/**
 * The unified entry point for a native client — an ID token from Google, or an
 * authorisation code from GitHub — turned into a session.
 *
 * Both branches used to carry their own copy of the provider's logic: a second
 * `tokeninfo` round trip for Google, a second hand-rolled code exchange for
 * GitHub. They now call the same code the web flow calls, so a fix in
 * `GoogleProvider` or `GithubProvider` reaches both.
 *
 * `redirectUri` is accepted and ignored: the exchange always uses the redirect
 * URI the provider was configured with, which is the one GitHub was asked to
 * send the code to. Passing a different one here could only produce a mismatch.
 */
export async function verifyOAuthToken(
  input: VerifyOAuthInput,
): Promise<SignInWithProviderResult> {
  const {
    provider,
    token,
    rememberMe,
    userAgent,
    ipAddress,
    deviceId,
    platform,
  } = input;

  let profile: OAuthProfile;

  if (provider === "google") {
    profile = await verifyGoogleIdToken(token);
  } else if (provider === "github") {
    const { accessToken } = await github.exchangeCode({ code: token });
    profile = await github.fetchProfile(accessToken);
  } else {
    throw unknownProviderError(provider);
  }

  return signInWithProvider({
    profile,
    rememberMe: rememberMe ?? true,
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(platform ? { platform } : {}),
  });
}
