# Kanban-Collab — Documentation

Kanban-Collab is a **real-time collaborative Kanban platform**: teams create workspaces and boards, organise work into columns and cards, and see changes propagate live across connected clients. The backend is a layered Node/TypeScript service (REST + a Yjs WebSocket collaboration layer) on MongoDB and Redis; the frontend is a React/TypeScript SPA built with Vite.

This `docs/` folder is the documentation set. Start with **Getting Started** if you just want it running; read **Architecture** and **Real-time Collaboration** if you want to understand how it works; use **API Reference** while integrating.

## Where to go

| Document | What it's for | Audience |
|---|---|---|
| [Getting Started](getting-started.md) | Run the whole stack in minutes and click through a first board | New users, evaluators |
| [Local Development](local-development.md) | Set up the server and client for development, run tests | Contributors |
| [Architecture](architecture.md) | System design: layers, request lifecycle, tech stack | Contributors, reviewers |
| [Data Model](data-model.md) | Every collection, field, relationship and index (ER diagram) | Contributors |
| [API Reference](api-reference.md) | Every REST endpoint, auth model, request/response shapes | Integrators, client devs |
| [Auth & Security](auth-security.md) | JWT/session model, CSRF, cookies, OAuth, rate limiting | Contributors, security reviewers |
| [Real-time Collaboration](realtime-collaboration.md) | The WebSocket + Yjs layer and how it persists to Mongo | Contributors |
| [Deployment](deployment.md) | Docker Compose, Render, environment, ops | Operators |
| [Contributing](contributing.md) | Workflow, code quality, tests, CI, conventions | Contributors |

## Conventions used here

- **Diagrams** are written in [Mermaid](https://mermaid.js.org/) and render inline on GitHub and in VS Code (with a Mermaid extension).
- **Code references** are given as `path/to/file.ts` relative to the repo root.
- **API paths** are shown relative to the versioned base `/api/v1` unless stated otherwise.
- Everything here describes the code as it exists in the repo — when behaviour and this document disagree, the code is the source of truth. Where the code and docs diverge, that's a bug worth a PR.

## Repository layout (top level)

```
kanban-collab/
├── client/         React + TypeScript SPA (Vite)
├── server/         Node + TypeScript API (REST + WebSocket/Yjs)
├── docs/           This documentation
├── docker-compose.yml         Full-stack (web + api + mongo + redis)
├── server/docker-compose.dev.yml  Infra only (mongo + redis) for local dev
├── render.yaml     Render blueprint (static client + web API)
└── .github/workflows/  CI/CD
```
