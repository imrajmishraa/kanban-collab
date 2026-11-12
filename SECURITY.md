# Security Policy

## Supported versions

Only the latest commit on `main` is supported. This project deploys
continuously; there are no maintained release branches.

## Reporting a vulnerability

Do **not** open a public issue.

Use GitHub's private advisory flow:
https://github.com/imrajmishraa/kanban-collab/security/advisories/new

Include the affected endpoint or file, a reproduction, and the impact you
believe it has. Expect an acknowledgement within 72 hours.

## Scope

In scope: authentication and session handling (JWT, refresh cookies, the OAuth
callback and its signed state), authorisation between workspaces and boards,
file upload handling, the WebSocket/Yjs layer, and anything that lets one
tenant read another tenant's data.

Out of scope: findings that require a compromised device, missing rate limits on
endpoints already behind authentication, and reports produced solely by an
automated scanner with no demonstrated impact.

## Handling of secrets

Secrets live in the hosting platform's environment (Vercel / Render), never in
the repository. If you believe a secret was committed, report it the same way —
do not paste the value into an issue.
