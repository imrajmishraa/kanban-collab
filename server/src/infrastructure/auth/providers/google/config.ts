import { OAUTH_CONFIG } from "../../../../config/oauth";

const config = OAUTH_CONFIG.google;

export const GOOGLE_CONFIG = {
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
  scopes: config.scopes,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
} as const;
