# Security Policy

Kanban-Collab is a real-time collaborative board. This document is the security
model for the deployed application: what is enforced today, what the trust
boundaries are, and what is still open. It is written to be checkable — every
control below names the file that implements it.

Only the latest commit on `main` is supported. The project deploys continuously;
there are no maintained release branches.

---

## 1. Reporting a vulnerability

Do **not** open a public issue.

Use GitHub's private advisory flow:
https://github.com/imrajmishraa/kanban-collab/security/advisories/new

Include the affected endpoint or file, a reproduction, and the impact you
believe it has. Expect an acknowledgement within 72 hours and an assessment
within 7 days. Credit is given in the advisory unless you ask otherwise.

If you believe a secret was committed, report it the same way — do not paste the
value into an issue.

### Safe harbour

Good-faith research on your own accounts and your own boards is welcome. Do not
access other tenants' data, do not run denial-of-service tests against the live
deployment, and do not use automated scanners against production. Stop as soon
as you have enough to demonstrate the issue.

### Scope

In scope:

- authentication and session handling — JWT, refresh rotation, the OAuth
  callback and its signed state
- authorisation between workspaces and boards (tenant isolation)
- the WebSocket/Yjs layer: upgrade authentication, per-board authorisation,
  message handling
- attachment upload credentials and the URLs they produce
- the CI/CD workflows in `.github/workflows/`
- anything that lets one tenant read or modify another tenant's data

Out of scope:

- findings that require a compromised device or a rooted browser
- missing rate limits on endpoints already behind authentication, where the
  impact is only cost
- reports produced solely by an automated scanner with no demonstrated impact
- the free-tier hosting behaviour itself (cold starts, sleeping instances)

---

## 2. Trust boundaries

```
browser  ──HTTPS──▶  client (Render static site)
   │                        │  fetch, credentials: "include"
   └────────HTTPS/WSS───────▶  API (Vercel function / Node)  ──▶  MongoDB, Redis
                                                              └─▶  ImageKit (CDN)
```

Four boundaries matter:

1. **Browser → API.** Untrusted input. Every request is authenticated by a
   bearer access token plus an httpOnly refresh cookie, and every unsafe method
   must carry the CSRF header.
2. **API → data stores.** Trusted network, but credentials are environment-only.
   Mongo and Redis are never exposed to the client.
3. **API → ImageKit.** The server hands the browser a short-lived signature; the
   browser uploads directly. File bytes never transit the API.
4. **GitHub Actions → hosting.** Deploys are triggered by deploy-hook URLs held
   as repository secrets, and only from `main` after checks pass.

The client is treated as hostile: it can be modified, and every authorisation
decision is made on the server.

---

## 3. Authentication

| Control | Implementation |
|---|---|
| Password hashing | bcrypt, cost 12 (env `BCRYPT_ROUNDS`, 8–15) — `server/src/infrastructure/security/password.ts` |
| Password policy | 8–128 characters — `server/src/interfaces/http/validators/auth/authValidator.ts` |
| Access token | JWT, HS256 only, 15 min default — `server/src/infrastructure/security/jwt.ts` |
| Algorithm pinning | `algorithms: [HS256]` on every `verify`, so `alg: none` and algorithm substitution fail |
| Refresh token | JWT carrying a random `jti`, 7 days (30 with "remember me") |
| Session record | A `Session` row per login keyed by `jti`, with user agent, IP and platform, revocable individually |
| Rotation | Every refresh issues a new `jti` and revokes the previous one |
| Reuse detection | A replayed `previousJti` revokes the whole session — `server/src/application/auth/refresh.ts` |
| Reset codes | Six digits, stored as SHA-256, single use, short TTL — `server/src/application/auth/passwordReset.ts` |

**Access tokens are never stored in `localStorage`.** They are held in memory by
the client; the long-lived credential is an httpOnly cookie the page cannot read.
The only things in `localStorage` are a theme preference, pane widths and the
active workspace id — none of which grant authority.

### OAuth (Google, GitHub)

- The `state` parameter is **signed, not stored**: an HMAC over
  `provider · nonce · expiry` using `OAUTH_STATE_SECRET`, with the HMAC key
  derived through `sha256("oauth-state:" + secret)`
  — `server/src/application/auth/oauth/stateToken.ts`.
- State is bound to the provider, so a state minted for Google cannot complete a
  GitHub callback.
- The callback lands on the client origin by design, and the code is exchanged
  server-side with the client secret. Provider error text never reaches a
  redirect URL; diagnostics go into structured `data` on an `ApiError`.
- OAuth sign-in does not create a second kind of session: it issues the same
  access token and refresh cookie as password login.

---

## 4. Sessions, cookies and CSRF

- The refresh cookie is `httpOnly`, `SameSite=None`, `Secure` in production
  (the client and API are on different origins, so `Lax` would never be sent)
  — `server/src/interfaces/http/utils/cookies.ts`.
- Because `SameSite=None` removes the browser's cross-site defence, CSRF is
  enforced explicitly: a readable `csrf_token` cookie must match the
  `X-CSRF-Token` header on every unsafe method, compared with
  `crypto.timingSafeEqual` — `server/src/interfaces/http/middleware/csrf.middleware.ts`.
- Credential-establishing endpoints (login, register, password reset, OAuth) are
  exempt, because they carry no ambient authority — otherwise a first-time
  visitor could never log in.
- `COOKIE_SECURE` and `COOKIE_DOMAIN` are explicit environment controls, so a
  misconfigured deployment fails loudly rather than silently downgrading.

---

## 5. Authorisation

One pure table decides every board request — no route decides for itself
(`server/src/application/boards/boardAccess.ts`):

| | `private` | `workspace` | `public` |
|---|---|---|---|
| **read** — owner / admin / member | yes | yes | yes |
| **read** — guest | no | yes | yes |
| **read** — not in the workspace | no | no | yes |
| **write** — owner / admin / member | yes | yes | yes |
| **write** — guest, or not in the workspace | no | no | no |
| **manage** (delete board or column) — owner / admin | yes | yes | yes |
| **manage** — member, guest, outsider | no | no | no |

Two rules follow from it:

- **Visibility widens who may read, never who may write.** A public board is not
  a wiki.
- **Destroying structure is owner/admin only.** A member can lose a board they
  cannot restore, so `manage` is narrower than `write`.

Enforcement points: the use case resolves the caller's role in the owning
workspace before it touches data, and the WebSocket upgrade applies the same
table per board, so a socket is bound to one board and cannot subscribe to
another (`server/src/interfaces/websockets/middlewares/authenticate.ts`).

One direction of trust: **the client sends intent, the server decides.** Object
ids arriving in a request body are always re-checked against the session's user.

---

## 6. Input handling

- Every request body, query and param is parsed by a zod schema in
  `server/src/interfaces/http/validators/` before a controller sees it. Nothing
  is hand-validated.
- Body limits: 1 MB JSON and 1 MB urlencoded. Compression is on; WebSocket
  frames are capped by `WS_MAX_PAYLOAD`.
- Key lookups on plain objects go through `Object.hasOwn` (as the OAuth failure
  message map does); `key in object` also matches `constructor` and `__proto__`,
  and is not used for lookups anywhere in `src/`.
- Database queries are Mongoose models with typed filters; no request string is
  ever concatenated into a query.
- The client renders user text through React's escaping. The one
  `dangerouslySetInnerHTML` in the tree is a static CSS string, not user content.

---

## 7. Transport and browser hardening

Helmet is applied at the edge of the stack
(`server/src/interfaces/http/app.ts`):

- CSP `default-src 'self'`, explicit `script-src`, `style-src`, `font-src`,
  `img-src`, `connect-src`
- `Cross-Origin-Opener-Policy: same-origin`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Powered-By` disabled
- HSTS is served by the platform edge; the API is HTTPS-only in production

CORS is an allowlist (`CORS_ORIGINS`), not a reflection of the request origin,
and it is enabled with `credentials: true` only for those origins.

Rate limits: a global bucket (`RATE_LIMIT_MAX`, default 300/min/IP), a stricter
auth bucket (10 failed attempts per 15 min, successful attempts not counted), and
a separate password-reset bucket. `standardHeaders: "draft-7"` so clients can
back off from `Retry-After`.

---

## 8. Secrets

All secrets live in the hosting platform's environment (Vercel for the API,
Render for the client), never in the repository. `.env.example` documents every
variable with a placeholder value.

| Secret | Purpose | Rotation |
|---|---|---|
| `JWT_SECRET` | signs access tokens | rotating invalidates all access tokens within 15 min; safe at any time |
| `JWT_REFRESH_SECRET` | signs refresh tokens | rotating logs every session out; do it after an incident |
| `OAUTH_STATE_SECRET` | signs OAuth state | rotating only affects in-flight logins |
| `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET` | provider code exchange | rotate at the provider, then in the platform |
| `IMAGEKIT_PRIVATE_KEY` | signs upload credentials | rotate at ImageKit; old signatures expire in 10 min |
| `MONGODB_URI`, `REDIS_URL` | data stores | rotate in the provider console |
| `VERCEL_DEPLOY_HOOK_SERVER`, `RENDER_DEPLOY_HOOK_WEB` | CI deploy triggers | treat as bearer credentials: anyone with the URL can deploy |

Never log a token, a code, a cookie or a password. The logger redacts
`authorization`, `cookie`, `set-cookie`, `x-csrf-token`, the whole parsed cookie
jar, and password/token fields in bodies
(`server/src/infrastructure/logging/logger.ts`). Diagnostics for a failed auth
attempt record `hasCookie` / `hasHeader` booleans, never values.

---

## 9. Supply chain

- **No new ESM-only dependency.** The server compiles to CommonJS; an ESM-only
  major is what took the API down once already. Dependabot is configured to hold
  majors for manual review (`AGENTS.md`, constraint 1).
- `npm audit --omit=dev --audit-level=high` is a blocking CI step on both
  packages; dev-only advisories are reported but do not block, because nothing in
  dev tooling is deployed.
- At the time of writing, `npm audit --omit=dev` reports **0 vulnerabilities** in
  both `server/` and `client/`.
- Lockfiles are committed and `npm ci` is the only install path in CI, so a
  resolved tree is what gets tested.

---

## 10. CI/CD

`.github/workflows/ci-cd.yml`:

- Triggers are `push` to `main` and `pull_request` only. There is no
  `pull_request_target`, no `workflow_run`, and no comment-triggered workflow, so
  no workflow runs with secrets on behalf of a fork.
- The top-level `GITHUB_TOKEN` is `contents: read` plus `pull-requests: read`.
  No job needs write access, because deploys use deploy hooks rather than the
  API.
- Deploys run only on `main`, only for the side that changed, and only after that
  side's checks passed. The `CI gate` job is the single required status, so a
  path-filtered skip cannot leave a PR stuck.
- No untrusted value is interpolated into a `run:` block; `GITHUB_BASE_REF` is
  passed through `env:`.
- `.github/workflows/keep-alive.yml` holds only `contents: read`, and its
  webhook URL is a secret.

---

## 11. What is not yet done

Ordered by what would hurt most if exploited. Each item is a concrete change, not
a principle.

**P1 — do next**

1. **Stop putting access tokens in a URL.** The client still connects as
   `wss://…/ws?token=…` (`client/.env.example`), and the query fallback exists in
   `server/src/interfaces/websockets/utils/parseRequest.ts`. Query strings land in
   proxy, CDN and platform access logs. Move the client to the
   `Sec-WebSocket-Protocol` subprotocol path that already exists, then delete the
   query fallback and log the deprecation for one release.
2. **Pin GitHub Actions to commit SHAs.** `actions/checkout@v7`,
   `actions/setup-node@v7` and `dorny/paths-filter@v4` are mutable tags. Replace
   with the full SHA plus a `# vX.Y.Z` comment.

**P2 — this quarter**

3. **Tighten the CSP.** `connect-src` currently allows bare `ws:` and `wss:`,
   which permits a socket to any host; list the one WebSocket origin. `script-src`
   allows `cdn.jsdelivr.net`, a third-party script origin — self-host that script
   or drop it. `style-src` allows `'unsafe-inline'`; nonces would remove it.
4. **Add PKCE to the OAuth flow.** The flow is confidential-client and exchanges
   the code server-side, so this is defence in depth against a leaked
   authorization code, not an open hole.
5. **Constrain attachment uploads.** The ImageKit signature is minted per user
   with a 10-minute TTL, but it does not restrict *what* may be uploaded. An
   allowlist of image MIME types and a max size must be enforced in the upload
   request, or a user can host HTML/SVG on a public CDN URL under the app's name.
6. **`extended: false` for urlencoded bodies,** and reject keys named
   `__proto__` / `constructor` / `prototype` in JSON bodies.
7. **Add secret scanning and static analysis to CI** — `gitleaks` on the diff and
   CodeQL for TypeScript — so a committed key is caught in the PR, not after the
   deploy.
8. **Rotate deploy hooks on a schedule,** or move to OIDC-scoped deploys. A
   deploy-hook URL is a bearer credential with no expiry.

**P3 — hardening**

9. **Password breach check** (HIBP k-anonymity) at registration and reset; the
   current policy is length-only.
10. **MFA (TOTP)** for accounts in shared workspaces, and a per-account lockout
    that survives an IP change — today the limit is per IP.
11. **`persist-credentials: false`** on every checkout that does not push back.
12. **Keep `/metrics` off the public origin.** `PROMETHEUS_ENABLED` is configured
    but no route is mounted today, so nothing is exposed; when it is mounted it
    must sit behind auth or an internal network.

---

## 12. Incident response

1. **Contain.** Rotate `JWT_REFRESH_SECRET` first — it invalidates every session
   in one step. Then `JWT_SECRET`, then any provider secret involved.
2. **Preserve.** Export the platform logs and the `Session` rows for the affected
   window before they age out; they carry user agent, IP and `jti`.
3. **Assess.** Which tenants, which boards, which window. The `jti` on each
   session is the join key between a token and its row.
4. **Notify.** Affected users, then a GitHub security advisory if the issue is in
   the published code.
5. **Fix forward.** The regression test lands with the fix, named after the rule
   it protects.

Reported issues are triaged against this document: if the behaviour is described
in §3–§10 it is intended and the report will say so; if it contradicts a control
here, it is a bug and will be treated as one.
