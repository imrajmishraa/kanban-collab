# Pattern — error handling

Designing an error is not handling one. This page is the line between them in
this repository, and the files that decide each.

| Question | Where it is answered |
|---|---|
| What does the API return? | the factories in `server/src/shared/errors/<domain>.ts` |
| What turns a thrown thing into that? | `server/src/shared/errors/normalizeError.ts` |
| What does the client branch on? | `client/src/services/apiError.ts` |
| What does the user see? | `client/src/components/feedback/LoadError.tsx`, and the form's own field errors |

`docs/api-reference.md` documents the shapes; this page is how to produce one.

## Server: design the error

`ApiError` carries `statusCode`, `code`, `isOperational`, `data` and `errors[]`,
and it **refuses a status below 400** — an error envelope on a 2xx is a
controller bug, and the constructor throws rather than ship it.

Three rules follow from that:

1. **Build from the domain factory, not the constructor.** `shared/errors/auth`,
   `board`, `card`, `column`, `workspace`, `fileUpload`, `websocket`, `env` — a
   bare `new ApiError(...)` in a controller is the finding.
2. **The client message is generic; the diagnostics go in `data`.** A provider's
   error text must never reach a redirect URL or a toast.
3. **`code` is the contract.** The client branches on it; `message` is for
   humans and may be reworded at any time.

`normalizeError` is an **ordered** list of matchers — Mongoose, Zod, JWT, Multer,
Redis — and the first non-null wins. A new error kind gets a matcher in that list,
in an order that does not shadow an earlier one.

## Client: handle it

- `services/apiError.ts` defines the envelope the client expects
  (`statusCode`, `success: false`, `message?`, `code?`, `errors?`, `data?`).
- **Branch on `code`, never on `message`.**
- Field errors come from `errors[]` and land on the field that caused them —
  `components/Tooltips/FieldErrorTooltip.tsx` is the pattern.
- A screen that failed to load shows `components/feedback/LoadError.tsx` with a
  retry, not a blank page.
- Retry only what is safe to retry: a GET, or a mutation that carries an
  idempotency key. A POST that creates a card is not retried blind.

## Anti-patterns

```ts
// breaks rule 1: an error built in a controller instead of its factory
throw new ApiError(404, "Board not found");

// breaks rule 2: provider text on the way to the user
res.redirect(`/auth/login?error=${providerError.message}`);

// breaks rule 3: the client reading a message it cannot rely on
if (error.message === "Invalid token") logout();

// swallowing — AGENTS.md §4, and the reason a failure shows as an empty board
try { await save(); } catch {}

// a retry with no bound
while (!ok) { ok = await save(); }
```

## Verification

```
cd server && npm run check
cd client && npm run check
```

- [ ] A new error has a factory, a `code`, and a line in `docs/api-reference.md`
- [ ] `grep -rn "new ApiError" server/src/interfaces` returns nothing new
- [ ] The client branches on `code`; `grep -rn "error.message ===" client/src` returns nothing
- [ ] A failed load shows `LoadError`, and a failed field shows its own tooltip
- [ ] No token, cookie or provider string is in a log line or a URL

## Where the skills sit

| Skill | Status | Would own |
|---|---|---|
| `api-error-design` | Unverified | the shape of the response: code, message, what the client can act on |
| `error-handling-patterns` | Unverified | where a failure is caught, retried or surfaced |

Neither has been read, so this page quotes neither. The authority is
`server/src/shared/errors/` and `docs/api-reference.md`.
