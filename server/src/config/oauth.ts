import { ENV } from "./env";

export type OAuthProviderName = "google" | "github";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  enabled: boolean;
}

export const OAUTH_CONFIG: Record<OAuthProviderName, OAuthConfig> = {
  google: {
    clientId: ENV.GOOGLE_CLIENT_ID ?? "",
    clientSecret: ENV.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: ENV.GOOGLE_REDIRECT_URI ?? "",
    scopes: ["openid", "email", "profile"],
    enabled: Boolean(
      ENV.GOOGLE_CLIENT_ID &&
      ENV.GOOGLE_CLIENT_SECRET &&
      ENV.GOOGLE_REDIRECT_URI,
    ),
  },
  github: {
    clientId: ENV.GITHUB_CLIENT_ID ?? "",
    clientSecret: ENV.GITHUB_CLIENT_SECRET ?? "",
    redirectUri: ENV.GITHUB_REDIRECT_URI ?? "",
    scopes: ["read:user", "user:email"],
    enabled: Boolean(
      ENV.GITHUB_CLIENT_ID &&
      ENV.GITHUB_CLIENT_SECRET &&
      ENV.GITHUB_REDIRECT_URI,
    ),
  },
};

export type OAuthStateBindingMode = "warn" | "required";

/**
 * Whether the OAuth state must be bound to the browser that started the flow.
 *
 * The login-CSRF callback arrives in a browser that never started the flow, so
 * it carries no state cookie. `warn` is precisely the mode that lets that
 * through — which is why production defaults to `required` and only an explicit
 * setting can lower it. Development and test keep `warn`: there the flow is
 * often served from a different origin than the callback, and a hard refusal
 * would be an obstacle rather than a defence.
 */
export function oauthStateBindingMode(): OAuthStateBindingMode {
  return ENV.OAUTH_STATE_BINDING ?? (ENV.IS_PROD ? "required" : "warn");
}

export function isProviderEnabled(name: string): name is OAuthProviderName {
  return (
    name in OAUTH_CONFIG && OAUTH_CONFIG[name as OAuthProviderName].enabled
  );
}
