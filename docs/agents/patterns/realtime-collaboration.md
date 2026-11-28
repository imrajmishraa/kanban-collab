# Pattern — real-time collaboration

Where the boundary is between the client's CRDT and the server's socket, and the
files that enforce each side.

`docs/realtime-collaboration.md` is the map: the document shape, the protocol,
persistence, lifecycle, and the open gaps. **This page does not repeat it.** What
it adds is the line an agent must not cross when changing either side, and the
four Yjs rules the code already relies on.

## The split

| Side | Owns | Never |
|---|---|---|
| Client (`client/src/services/collaboration/`) | writing the shared document: card create/update/delete/move, column add/rename/delete | authoring board-level `meta` (that still goes over REST), or holding presence in the document |
| Server (`server/src/interfaces/websockets/`) | relaying updates, authenticating the upgrade, heartbeat, persistence, reconciliation | authoring board state — it relays and persists, it does not decide |

> The client paths are `client/src/services/collaboration/`. The table in
> `docs/realtime-collaboration.md` drops the `services/` segment — follow the
> code, and fix the table where you touch it.

## Read first

| File | Why |
|---|---|
| `docs/realtime-collaboration.md` | the map, the protocol, the known gaps |
| `client/src/services/collaboration/boardDoc.ts` and `server/src/interfaces/websockets/collaboration/yjs/boardSchema.ts` | the two mirrors of the document shape — they must agree |
| `client/src/services/collaboration/origins.ts` | `ORIGIN_LOCAL`, `ORIGIN_REMOTE`, `ORIGIN_REDIS` — the echo guards read these |
| `server/src/interfaces/websockets/collaboration/yjs/boardWriteThrough.ts` | REST writes into the document, tagged `ORIGIN_HTTP` |
| `server/src/interfaces/websockets/collaboration/persistence/boardReconciler.ts` | how the CRDT becomes `columns` / `cards` rows |
| `server/src/shared/constants/websocket.ts` | the close codes, 4000–4999 |

## Four Yjs rules this code depends on

**1. One transaction per action, and it carries an origin.** `doc.transact(mutate,
ORIGIN_HTTP)` is the shape; the client tags its own edits `ORIGIN_LOCAL`, applies
network updates as `ORIGIN_REMOTE`, and the server re-applies Redis pub/sub as
`ORIGIN_REDIS`. Bundling matters for more than tidiness: one transaction is one
`update` event, which is one message on the wire.

**2. `update` is the only thing that leaves the process.** The event order is
fixed — `beforeTransaction` → transaction → `beforeObserverCalls` → `observe` /
`observeDeep` → `afterTransaction` → `update`. The broadcaster listens to
`update`; observers are for rendering. A network send inside an observer sends
the same change twice.

**3. `doc.gc` stays on.** Turning garbage collection off is for restoring deleted
content later. This repo reconciles the CRDT into Mongo and never restores from
the document, so GC-off would grow every board's document for no reader.

**4. A throwaway `new Y.Doc()` is a decoder, not a document.** `yjsUpdateCodec.ts`
applies an update to a fresh doc to read it. That doc never gets an origin, never
broadcasts and is discarded — it is not a second document for the board.

`clientID` is per session and must never be persisted or reused: presence is
keyed by user id, not by clientID.

## Five rules of the boundary

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
// breaks Yjs rule 1: one transaction per mutation inside a loop
cards.forEach((card) => doc.transact(() => map.set(card.id, card)));

// breaks Yjs rule 2: sending from an observer instead of the update event
map.observe(() => provider.sendUpdate());   // duplicates, and races the echo guard

// breaks Yjs rule 3: GC off with no reader for the history
doc.gc = false;

// breaks boundary rule 1: a cursor in the document, persisted with the board
doc.getMap("presence").set(userId, { x, y });

// breaks boundary rule 2: an update applied with no origin
Y.applyUpdate(doc, update);                 // the echo guard cannot skip it

// breaks boundary rule 5: the reconciler writing board-level fields
await Board.updateOne({ _id }, { name: doc.getMap("meta").get("name") });
```

## Verification

```
cd server && npm run check
cd client && npx vitest run src/services/collaboration
```

- [ ] `boardDoc.ts` and `boardSchema.ts` changed together, or neither changed
- [ ] A new close code is in `shared/constants/websocket.ts` **and** the doc
- [ ] Two browsers, one board: an edit in one arrives in the other, and a reload
      does not resurrect a stale cursor
- [ ] Kill the socket mid-edit: the client shows `reconnecting` and resyncs
      without duplicating the card
- [ ] A REST write to a seeded board lands in the document (`ORIGIN_HTTP`), and
      one to an unseeded board returns false rather than half-applying

## Where the skills sit

| Skill | Status | Would own |
|---|---|---|
| `yjs` | Unverified | the document model and what is shared rather than local |
| `yjs-best-practices` | Unverified | awareness, undo scope, garbage collection |
| `websocket-engineer` | Unverified | the server's socket: reconnect, backoff, presence, fan-out |
| `redis-connections` | Verified | the pub/sub connection behind `redisSync` — timeouts, reconnects, and the commands not to call |

The three Yjs and socket skills have not been read, so this page quotes none of
them. The rules above come from `docs/realtime-collaboration.md`, the Yjs API
reference, and the files it names — those are the authority
([`../skill-selection.md`](../skill-selection.md)).
