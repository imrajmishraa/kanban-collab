import type { AuthProvider } from "../../db/mongoose/schemas";

export interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface AuthorizeUrlParams {
  state: string;
  codeChallenge?: string;
}

export interface ExchangeCodeParams {
  code: string;
  codeVerifier?: string;
}

export interface ExchangeCodeResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface OAuthProvider {
  readonly name: AuthProvider;
  getAuthorizeUrl(params: AuthorizeUrlParams): string;
  exchangeCode(params: ExchangeCodeParams): Promise<ExchangeCodeResult>;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}
