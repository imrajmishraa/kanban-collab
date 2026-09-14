import type { AuthProvider } from "../../db/mongoose/schemas";
import { OAUTH_CONFIG, type OAuthProviderName } from "../../../config/oauth";
import { GoogleProvider } from "./google/GoogleProvider";
import { GithubProvider } from "./github/GithubProvider";
import type { OAuthProvider } from "./types";
import {
  providerDisabledError,
  unknownProviderError,
} from "../../../shared/errors/auth/oauth";

const registry = new Map<AuthProvider, OAuthProvider>([
  ["google", new GoogleProvider()],
  ["github", new GithubProvider()],
]);

export function getProvider(name: string): OAuthProvider {
  if (!(name in OAUTH_CONFIG)) throw unknownProviderError(name);

  const providerName = name as OAuthProviderName;
  if (!OAUTH_CONFIG[providerName].enabled) {
    throw providerDisabledError(name);
  }

  const provider = registry.get(providerName as AuthProvider);
  if (!provider) throw unknownProviderError(name);

  return provider;
}

export function listEnabledProviders(): OAuthProviderName[] {
  return (Object.keys(OAUTH_CONFIG) as OAuthProviderName[]).filter(
    (name) => OAUTH_CONFIG[name].enabled,
  );
}

export type { OAuthProvider };
