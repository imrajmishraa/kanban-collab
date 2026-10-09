# Auth & Security

Kanban-Collab uses **short-lived JWT access tokens** for authorisation and **rotating refresh tokens in an httpOnly cookie** for session continuity, with double-submit-cookie CSRF protection. This document explains the model; the endpoints are in [API Reference](api-reference.md).

## Token model at a glance

| | Access token | Refresh token |
|---|---|---|
| Format | JWT (HS256) | JWT (HS256) |
| Carried in | `Authorization: Bearer …` | `refreshToken` httpOnly cookie |
| Lifetime | `JWT_ACCESS_EXPIRES_IN` (default **15m**) | `JWT_REFRESH_EXPIRES_IN` (**7d**), or **30d** with `rememberMe` |
| Secret | `JWT_SECRET` | `JWT_REFRESH_SECRET` (must differ) |
| Stored server-side | No | Yes — a `Session` document per device |

Access tokens are **stateless** — the server doesn't look them up. Refresh tokens are **stateful**: each one maps to a `Session` row (see [Data Model](data-model.md)), which is what makes rotation and reuse detection possible.

## Login → refresh → reuse

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API
    participant DB as Mongo (sessions)
    C->>API: POST /auth/login {email, password}
    API->>DB: verify credentials, create Session { jti }
    API-->>C: { accessToken } + Set-Cookie: refreshToken
    Note over C,API: access token expires after ~15m
    C->>API: POST /auth/refresh (cookie + X-CSRF-Token)
    API->>DB: find Session by userId + jti
    API->>DB: rotate jti; keep previousJti for a 30s grace window
    API-->>C: { accessToken } + new refreshToken cookie
    Note over C,API: an old token replayed later → revoke only THAT session
```

## Refresh rotation & reuse detection

Every refresh **rotates** the token: the session's `jti` is replaced, and the old `jti` is remembered as `previousJti` with a short `previousJtiExpiresAt` grace window (30 s) so that concurrent requests from the same client don't trip the alarm.

If a refresh presents a `jti` that matches no live session, that's treated as **reuse** (a replayed/leaked token): the request is rejected with `REFRESH_TOKEN_REUSE_DETECTED`, and the single session that the token belongs to is revoked. It is deliberately **scoped to that one session** — not every session for the user — so a stale token can't log the user out on all their devices.

Sessions are additionally:
- **Expiring** — `expiresAt` carries a TTL index, so dead sessions are reaped automatically; the lookup also filters `expiresAt > now`.
- **Revocable** — `revokedAt` marks a session dead (logout, or reuse detection).
- **Observable** — `userAgent`, `ipAddress`, `deviceId`, `platform` are recorded per session so a user can see where they're signed in.

## Cookies

Two cookies are involved. Their attributes are centralised so they can't drift apart (`server/src/interfaces/http/utils/cookies.ts`):

| Cookie | Purpose | httpOnly | SameSite | Path |
|---|---|---|---|---|
| `refreshToken` | carries the refresh JWT | **yes** | `none` in production, `lax` otherwise | `/api/v1/auth` |
| `csrf_token` | double-submit CSRF token | no (JS must read it) | mirrors the refresh cookie | `/` |

`Secure` is driven by `COOKIE_SECURE` (defaults to `NODE_ENV === "production"`), and `SameSite=None` requires `Secure` — so in production both cookies are `SameSite=None; Secure`, which is what a cross-site (separate API and web origin) deployment needs. `COOKIE_DOMAIN` can scope them to a parent domain.

## CSRF protection

The app authenticates with a Bearer header, but the refresh cookie is sent **ambiently** — so any state-changing endpoint reachable with that cookie is CSRF-exposed. The server uses the standard **double-submit** pattern (`interfaces/http/middleware/csrf.middleware.ts`):

1. `issueCsrfCookie` ensures a readable `csrf_token` cookie exists.
2. `csrfProtection` requires the same value in the `X-CSRF-Token` header on every unsafe method (POST/PUT/PATCH/DELETE), compared with `timingSafeEqual`.

Credential-establishing endpoints (`/auth/login`, `/auth/register`, `/auth/oauth`) and the health routes are exempt — a first-time visitor has no cookie yet. `/auth/refresh` and `/auth/logout` are **not** exempt.

## OAuth (Google & GitHub)

- Each provider is enabled only when all three of `*_CLIENT_ID`, `*_CLIENT_SECRET`, `*_REDIRECT_URI` are set (all-or-nothing — enforced at boot).
- `GET /auth/oauth/:provider` starts the flow with a signed `state` value (stored in the `oauth_state` cookie) to prevent CSRF on the callback.
- `GET /auth/oauth/:provider/callback` validates state, exchanges the code, fetches the profile, and links or creates the user via the `authProviders[]` array.
- A user may link multiple providers; a user must always have **at least one** auth provider (schema-level validation).

## Passwords

Passwords are hashed with **bcrypt** at `BCRYPT_ROUNDS` (default 12) and stored in `passwordHash`, which is declared `select: false` so it is never returned by default queries. Minimum length is 8, maximum 128.

## Defence in depth

| Control | Where | Notes |
|---|---|---|
| Security headers | `helmet` | plus nginx/Render header rules |
| CORS | `CORS_ORIGINS` (CSV) | only the listed origins |
| Body limits | `express.json({ limit: "1mb" })` | prevents oversized payloads |
| Rate limiting | `express-rate-limit` | global 300/60s; auth 10/window |
| Proxy awareness | `TRUST_PROXY` | correct client IPs behind a proxy |
| Error hygiene | `errorHandler` | no stack traces in production |
| Env validation | `config/env.ts` | rejects insecure prod secrets at boot |

## Operational notes

- **Rotate secrets** by setting new `JWT_SECRET`/`JWT_REFRESH_SECRET`; existing access tokens become invalid immediately (they're stateless), and refresh tokens fail verification, forcing re-login.
- **Reuse detection is scoped**, so a leaked refresh token logs out the affected device, not the whole account.
- **`SameSite` mismatch** between the refresh and CSRF cookies would break refresh behind a cross-site setup — both are now driven from one source of truth.

## Known gaps (worth knowing)

These are open items in the current code, tracked for future work:

- **WebSocket authorization** checks workspace membership but not board **visibility** or member **role** — see [Real-time Collaboration](realtime-collaboration.md).
- The **access token is passed in the WebSocket query string** and can appear in logs; a subprotocol alternative is defined in `shared/constants/websocket.ts` but not yet wired up.
- **`SESSION_EXPIRED`** (WS close code 4004) is defined but not yet sent — live sockets aren't closed when a token expires.
