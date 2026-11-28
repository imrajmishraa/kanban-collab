# Pattern — real-time collaboration

Where the boundary is between the client's CRDT and the server's socket, and the
files that enforce each side.

`docs/realtime-collaboration.md` is the map: the document shape, the protocol,
persistence, lifecycle, and the open gaps. **This page does not repeat it.** What
it adds is the line an agent must not cross when changing either side.

## The split

| Side | Owns | Never |
|---|---|---|
| Client (`client/src/collaboration/`) | writing the shared document: card create/update/delete/move, column add/rename/delete | authoring board-level `meta` (that still goes over REST), or holding presence in the document |
| Server (`server/src/interfaces/websockets/`) | relaying updates, authenticating the upgrade, heartbeat, persistence, reconciliation | authoring board state — it relays and persists, it does not decide |

## Read first

| File | Why |
|---|---|
| `docs/realtime-collaboration.md` | the map, the protocol, the known gaps |
| `client/src/collaboration/boardDoc.ts` and `server/src/interfaces/websockets/collaboration/yjs/boardSchema.ts` | the two mirrors of the document shape — they must agree |
| `client/src/collaboration/origins.ts` | the origin tags the echo guards rely on |
| `server/src/interfaces/websockets/collaboration/persistence/boardReconciler.ts` | how the CRDT becomes `columns` / `cards` rows |
| `server/src/shared/constants/websocket.ts` | the close codes, 4000–4999 |

## Five rules

**1. Presence is not document state.** Cursors, selection and "who is here" go
through awareness, never into the shared doc — a persisted cursor is a ghost that
survives a reload.

**2. Every update carries an origin.** The broadcaster skips the origin it came
from; an update with no origin is an echo loop.

**3. One document per board.** `boardId` is the document name; a second name for
the same board is a second board.

**4. Close codes are protocol.** 4001 unauthorized, 4003 forbidden, 4004 session
expired, 4005 heartbeat timeout, 4050 server shutdown. A new code is added to
`shared/constants/websocket.ts` and to `docs/realtime-collaboration.md` together.

**5. The reconciler is one-way.** It projects the CRDT into `Column` and `Card`
rows; it never writes `Board`, and it trusts the `boardId` / `workspaceId` the
client put in the record. A UI PR that starts writing `meta` does not make that
safe.

## Do not fix these by accident

`docs/realtime-collaboration.md` lists four open gaps: awareness is applied but
never fanned out, `bindRedisSync` returns early while Redis is disconnected, the
reconciler never writes board-level `meta`, and its prune step can drop rows the
CRDT omits. They are roadmap items with their own PRs. A card-layout change that
happens to make one of them worse is a bug in the card change.

## Anti-patterns

```ts
// breaks rule 1: a cursor in the document, persisted with the board
doc.getMap("presence").set(userId, { x, y });

// breaks rule 2: an update applied without an origin tag
Y.applyUpdate(doc, update);          // no origin → the echo guard cannot skip it

// breaks rule 5: the reconciler writing board-level fields
await Board.updateOne({ _id }, { name: doc.getMap("meta").get("name") });

// a second document for the same board
new Y.Doc({ guid: `${boardId}-draft` });
```

## Verification

```
cd server && npm run check          # types, layers, unit + integration
cd client && npx vitest run src/collaboration
```

- [ ] `boardDoc.ts` and `boardSchema.ts` changed together, or neither changed
- [ ] A new close code is in `shared/constants/websocket.ts` **and** the doc
- [ ] Two browsers, one board: an edit in one arrives in the other, and a reload
      does not resurrect a stale cursor
- [ ] Kill the socket mid-edit: the client shows `reconnecting` and resyncs
      without duplicating the card

## Where the skills sit

| Skill | Status | Would own |
|---|---|---|
| `yjs` | Unverified | the document model and what is shared rather than local |
| `yjs-best-practices` | Unverified | awareness, undo scope, garbage collection |
| `websocket-engineer` | Unverified | the server's socket: reconnect, backoff, presence, fan-out |

None of the three has been read, so this page quotes none of them. The rules above
come from `docs/realtime-collaboration.md` and the files it names — those are the
authority ([`../skill-selection.md`](../skill-selection.md)).
