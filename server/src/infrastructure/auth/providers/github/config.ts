import { OAUTH_CONFIG } from "../../../../config/oauth";

const config = OAUTH_CONFIG.github;

export const GITHUB_CONFIG = {
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
  scopes: config.scopes,
  authorizeUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  userUrl: "https://api.github.com/user",
  emailsUrl: "https://api.github.com/user/emails",
} as const;
