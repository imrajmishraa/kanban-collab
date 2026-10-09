# API Reference

The server exposes a **versioned REST API** under `/api/v1` plus a **WebSocket** channel for real-time collaboration (documented in [Real-time Collaboration](realtime-collaboration.md)).

- **Base URL (local):** `http://localhost:3000`
- **Version prefix:** `/api/v1`
- **Content type:** `application/json`
- **Health endpoints** are unversioned (`/healthz`, `/readyz`, `/websocket`).

## Authentication

Two things are needed for a typical authenticated request:

1. **Access token** — a short-lived JWT sent as `Authorization: Bearer <accessToken>`. Obtain it from `POST /auth/login` or `POST /auth/refresh`. Every route except the credential-establishing ones requires it.
2. **CSRF token** — the server issues a readable `csrf_token` cookie; unsafe methods (POST/PUT/PATCH/DELETE) must echo it in the **`X-CSRF-Token`** header. Exempt paths: `/auth/login`, `/auth/register`, `/auth/oauth`, and the health routes. (`/auth/refresh` and `/auth/logout` **do** require it.)

The **refresh token** is never returned in a body — it lives in an `httpOnly` cookie named `refreshToken` and is sent automatically. See [Auth & Security](auth-security.md) for the full model.

## Response envelope

**Success:**

```json
{ "statusCode": 200, "success": true, "message": "…", "data": { } }
```

**Error:**

```json
{ "statusCode": 404, "success": false, "message": "Not Found", "code": "BOARD_NOT_FOUND", "errors": null, "data": null }
```

`code` is a machine-readable identifier (e.g. `VALIDATION_FAILED`, `ACCESS_TOKEN_EXPIRED`, `REFRESH_TOKEN_REUSE_DETECTED`). `errors` carries field-level detail for validation failures. `stack` appears only in development.

## Rate limits

| Scope | Env | Default |
|---|---|---|
| All `/api/v1` | `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | 300 per 60 s |
| `/api/v1/auth` | `AUTH_RATE_LIMIT_MAX` | 10 per window |

Exceeding a limit returns `429`.

---

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/healthz` | none | **Liveness** — `200` while the process is up. Does not check dependencies. |
| GET | `/readyz` | none | **Readiness** — checks Mongo + Redis; `200` if all up, `503` otherwise. |
| GET | `/websocket` | none | WebSocket-layer health snapshot. |

`/healthz` → `data: { status: "UP", timestamp, uptimeSeconds, env }`.

---

## Auth — `/api/v1/auth`

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/register` | none | `{ email, password, fullName, deviceId?, platform? }` | `201` → `{ userId, email, fullName, emailVerified }` |
| POST | `/login` | none | `{ email, password, rememberMe?, deviceId?, platform? }` | `200` → `{ accessToken, expiresIn, user }` + sets refresh cookie |
| POST | `/refresh` | cookie + CSRF | — | `200` → `{ accessToken, expiresIn, user }` + rotates refresh cookie |
| POST | `/logout` | cookie + CSRF | — | `200` → `data: null` + clears refresh cookie |
| GET | `/me` | Bearer | — | `200` → the user profile |

**Notes**
- `register` does **not** return tokens — follow with `login`.
- `password`: 8–128 chars. `fullName`: 2–80. `platform` ∈ `web | ios | android | desktop`.
- `rememberMe` (login) extends the refresh cookie to 30 days; otherwise it's a session cookie.
- Bodies are **strict** — unknown fields are rejected.

### OAuth — `/api/v1/auth/oauth`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | none | List configured providers (`google`, `github`). |
| GET | `/:provider` | none | Start the OAuth flow — redirects to the provider. |
| GET | `/:provider/callback` | none | Provider callback; completes sign-in and redirects to the client. |

---

## Workspaces — `/api/v1/workspaces`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| POST | `/` | Bearer + CSRF | `{ name, slug, description? }` | Create a workspace |
| GET | `/` | Bearer | `?search=&page=&limit=` | List workspaces the user belongs to |
| PATCH | `/:workspaceId` | Bearer + CSRF | `{ name?, slug?, description? }` | Update |
| DELETE | `/:workspaceId` | Bearer + CSRF | — | Schedule deletion (soft) |
| GET | `/:workspaceId/members` | Bearer | — | List members |
| POST | `/:workspaceId/members` | Bearer + CSRF | `{ email, role? }` | Add a member |
| PATCH | `/:workspaceId/members/:memberId` | Bearer + CSRF | `{ role }` | Change a member's role |
| DELETE | `/:workspaceId/members/:memberId` | Bearer + CSRF | — | Remove a member |
| POST | `/:workspaceId/leave` | Bearer + CSRF | — | Leave the workspace |

**Notes**
- `slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` and is unique. `name`/`slug` 3–100, `description` ≤ 500.
- `role` ∈ `owner | admin | member | guest`. **Only an owner may grant or revoke `owner`**, and the last owner cannot be demoted/removed.
- `DELETE /:workspaceId` is a **soft delete** — it sets `status: deletion_pending` and a `deletionScheduledFor`; a cron job performs the hard delete later.

---

## Boards — `/api/v1`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| POST | `/boards` | Bearer + CSRF | `{ workspaceId, name, description?, backgroundColor?, coverImageUrl?, visibility? }` | Create |
| GET | `/boards` | Bearer | `?workspaceId=&page=&limit=&include=` | List boards in a workspace |
| GET | `/boards/:boardId` | Bearer | — | Board details |
| PATCH | `/boards/:boardId` | Bearer + CSRF | `{ name?, description?, backgroundColor?, coverImageUrl?, visibility? }` | Update |
| DELETE | `/boards/:boardId` | Bearer + CSRF | — | Delete |
| POST | `/boards/:boardId/share` | Bearer + CSRF | `{ email, role? }` | Invite a user to the board's workspace |
| GET | `/boards/:boardId/activity` | Bearer | `?limit=` | Board activity feed |

**Notes**
- `visibility` ∈ `private | public | workspace`. `backgroundColor` is a hex colour. `include=columns,cards` opts into embedding child data in the list response.
- `share` `role` ∈ `member | guest`. It adds the email to the board's workspace and raises a `BOARD_SHARED` notification.

## Columns — `/api/v1`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/columns` | Bearer + CSRF | `{ boardId, name, orderIndex }` | Create a column |
| PATCH | `/columns/:columnId` | Bearer + CSRF | `{ name?, orderIndex? }` | Update |
| DELETE | `/columns/:columnId` | Bearer + CSRF | — | Delete |

## Cards — `/api/v1`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/cards/search` | Bearer | `?boardId=&q=` | Full-text search (board-scoped) |
| POST | `/cards` | Bearer + CSRF | `{ columnId, boardId, title, description?, orderIndex?, dueDate?, members?, labels? }` | Create |
| PATCH | `/cards/:cardId` | Bearer + CSRF | `{ title?, columnId?, description?, dueDate?, members?, labels?, isArchived? }` | Update |
| PATCH | `/cards/:cardId/move` | Bearer + CSRF | `{ targetColumnId, targetOrderIndex }` | Move to another column |
| DELETE | `/cards/:cardId` | Bearer + CSRF | — | Delete |

**Notes**
- The target `columnId` (create/update) and `targetColumnId` (move) must belong to the **same board** as the card, or the request fails with `COLUMN_NOT_FOUND`.
- `dueDate` is an ISO datetime; send `null` on update to clear it. `members` is an array of user ids; `labels` an array of strings.
- Search is **board-scoped** (`boardId` required) and backed by a MongoDB text index.

## Comments — `/api/v1`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/cards/:cardId/comments` | Bearer | — | List a card's comments |
| POST | `/cards/:cardId/comments` | Bearer + CSRF | `{ text }` | Add a comment |
| DELETE | `/comments/:commentId` | Bearer + CSRF | — | Delete (author, or workspace owner/admin) |

`text` ≤ 5000 chars.

## Attachments — `/api/v1`

Uploads go **browser → ImageKit directly**; the server only signs and records the URL.

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/attachments/imagekit-auth` | Bearer | — | ImageKit upload auth (signature + token + expire) |
| GET | `/cards/:cardId/attachments` | Bearer | — | List a card's attachments |
| POST | `/cards/:cardId/attachments` | Bearer + CSRF | `{ url, name, fileType, size? }` | Record an uploaded file |
| DELETE | `/cards/:cardId/attachments/:attachmentId` | Bearer + CSRF | — | Remove an attachment |

---

## Dashboard — `/api/v1/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | Aggregated home data (recent boards, counts, recent activity) |

## Notes — `/api/v1/notes`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/` | Bearer | `?workspaceId=&boardId=` | List notes (`workspaceId` required) |
| POST | `/` | Bearer + CSRF | `{ workspaceId, boardId?, title, body?, isPinned? }` | Create |
| PATCH | `/:noteId` | Bearer + CSRF | `{ title?, body?, isPinned? }` | Update |
| DELETE | `/:noteId` | Bearer + CSRF | — | Delete |

`title` ≤ 200, `body` ≤ 20000.

## Notifications — `/api/v1/notifications`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/preferences` | Bearer | — | Get the caller's notification preferences |
| PATCH | `/preferences` | Bearer + CSRF | `{ preferences?, quietHours?, digestFrequency? }` | Update preferences |
| GET | `/` | Bearer | `?limit=&unread=` | List notifications |
| PATCH | `/read-all` | Bearer + CSRF | — | Mark all read |
| PATCH | `/:notificationId/read` | Bearer + CSRF | — | Mark one read |

**Notes**
- `preferences` is a map of notification-type → `{ inApp, email, push, sms }` (partial updates allowed). Types are owned by the schema and accepted dynamically.
- `quietHours` is `{ start, end, timezone, enabled }` with `HH:MM` times. `digestFrequency` ∈ `off | daily | weekly`.

---

## WebSocket

The collaboration channel is a WebSocket upgrade at **`/ws`**, authenticated with the access token and scoped to a board:

```
ws(s)://<host>/ws?token=<accessToken>&boardId=<boardId>
```

Message framing, the Yjs sync/awareness protocol, and persistence are documented in [Real-time Collaboration](realtime-collaboration.md).
