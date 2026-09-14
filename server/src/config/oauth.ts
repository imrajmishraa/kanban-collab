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

export function isProviderEnabled(name: string): name is OAuthProviderName {
  return (
    name in OAUTH_CONFIG && OAUTH_CONFIG[name as OAuthProviderName].enabled
  );
}
