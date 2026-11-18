/**
 * The lifecycle of one WebSocket connection, as a state instead of flags.
 *
 * `handleConnection` tracked this in three locals — `client`, `document` and a
 * `registered` boolean — and the teardown sequence was written out twice: once
 * in the `close` handler, once in the `catch` block. They had already drifted
 * once (the catch path forgot to clear presence, which is how a ghost cursor
 * survived a failed connection), and "already torn down" was expressed by a
 * boolean that each path had to remember to reset.
 *
 * A connection is now in exactly one of four phases, and teardown is a
 * transition that reports what to undo — idempotently, from any phase.
 *
 *   new ──REGISTERED──▶ registered ──READY──▶ ready
 *    │                     │                  │
 *    └────────CLOSED───────┴──────CLOSED──────┴──▶ closed
 */

export type ConnectionPhase = "new" | "registered" | "ready" | "closed";

export type ConnectionEvent =
  { type: "REGISTERED" } | { type: "READY" } | { type: "CLOSED" };

/**
 * What the caller must undo, in order.
 *
 * `unregister` is always last: the registry entry is the thing that makes the
 * connection visible to metrics and shutdown, so it goes away once everything
 * it refers to has been released.
 */
export type ConnectionEffect =
  "detach-client" | "clear-awareness" | "schedule-idle-cleanup" | "unregister";

export interface ConnectionTransition {
  phase: ConnectionPhase;
  effects: ConnectionEffect[];
}

export const NEW_CONNECTION: ConnectionPhase = "new";

const NO_EFFECTS: ConnectionEffect[] = [];

/**
 * What still needs undoing when a connection closes.
 *
 * Split out so the transition reads as a table and the per-phase teardown is
 * one small, exhaustive function.
 */
function teardownEffects(phase: ConnectionPhase): ConnectionEffect[] {
  switch (phase) {
    case "new":
      /* The socket never made it into the registry: nothing to undo. */
      return NO_EFFECTS;

    case "registered":
      return ["unregister"];

    case "ready":
      return [
        "detach-client",
        "clear-awareness",
        "schedule-idle-cleanup",
        "unregister",
      ];

    case "closed":
      /* Already torn down — the close handler and the catch block both run for
         one failed connection, and only the first should do the work. */
      return NO_EFFECTS;
  }
}

export function transitionConnectionPhase(
  phase: ConnectionPhase,
  event: ConnectionEvent,
): ConnectionTransition {
  switch (event.type) {
    case "REGISTERED": {
      /* Registering twice would leak the first registry entry — the map is
         keyed by a fresh uuid each time. */
      if (phase !== "new") return { phase, effects: NO_EFFECTS };

      return { phase: "registered", effects: NO_EFFECTS };
    }

    case "READY": {
      /* Only a registered connection can become ready; a failure before that
         (no document, no client) must not pretend it is live. */
      if (phase !== "registered") return { phase, effects: NO_EFFECTS };

      return { phase: "ready", effects: NO_EFFECTS };
    }

    case "CLOSED": {
      return { phase: "closed", effects: teardownEffects(phase) };
    }

    default: {
      const exhaustive: never = event;
      throw new Error(`Unhandled connection event: ${String(exhaustive)}`);
    }
  }
}

/** True once the connection can no longer be used. */
export function isClosed(phase: ConnectionPhase): boolean {
  return phase === "closed";
}
