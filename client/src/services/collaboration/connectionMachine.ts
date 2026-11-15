/**
 * The connection state machine behind `YjsProvider`, as a table.
 *
 * The provider used to keep this state in four separate fields — `status`,
 * `synced`, `intentionalClose`, `reconnectAttempt` — and decide the next state
 * inside five event handlers. Every rule was implicit, so the interesting cases
 * (a close that arrives while still connecting, an error followed by its close,
 * a disconnect during a pending reconnect) could only be checked by hand.
 *
 * This module is pure: it takes the current state and an event, and returns the
 * next state plus the effects the caller must run. No sockets, no timers, no
 * callbacks — which is what makes the races testable.
 *
 *   idle ──CONNECT──▶ connecting ──OPEN──▶ connected ──SYNCED──▶ connected(synced)
 *                        │                     │
 *                        └─────CLOSE───────────┘
 *                                 ▼
 *                           reconnecting ──CONNECT──▶ reconnecting(attempt n)
 *                                 │
 *                        DISCONNECT / DESTROY
 *                                 ▼
 *                        disconnected / idle
 */

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface ConnectionState {
  status: ConnectionStatus;
  /** True once the first server sync (state) has been applied. */
  synced: boolean;
  /**
   * True when the caller asked to close. It is the only thing that separates
   * `disconnected` from `reconnecting`, because both are reached through the
   * same socket `close` event.
   */
  intentional: boolean;
  /** Consecutive failed attempts. Drives the backoff and resets on open. */
  attempt: number;
}

export type ConnectionEvent =
  | { type: "CONNECT" }
  | { type: "OPEN" }
  | { type: "SYNCED" }
  | { type: "CLOSE" }
  | { type: "ERROR" }
  | { type: "SOCKET_FAILED" }
  | { type: "DISCONNECT" }
  | { type: "DESTROY" };

export type ConnectionEffect =
  | "open-socket"
  | "close-socket"
  | "detach-socket"
  | "teardown-listeners"
  | "send-sync-step-1"
  | "send-full-awareness"
  | "schedule-reconnect"
  | "clear-reconnect-timer"
  | "remove-local-awareness"
  | "report-error";

export interface ConnectionTransition {
  state: ConnectionState;
  effects: ConnectionEffect[];
}

export const INITIAL_CONNECTION_STATE: ConnectionState = {
  status: "idle",
  synced: false,
  intentional: false,
  attempt: 0,
};

const NO_EFFECTS: ConnectionEffect[] = [];

export function transitionConnection(
  state: ConnectionState,
  event: ConnectionEvent,
): ConnectionTransition {
  switch (event.type) {
    case "CONNECT": {
      /* Already live or mid-handshake: opening a second socket would double
         every sync message and every presence update. */
      if (state.status === "connecting" || state.status === "connected") {
        return { state, effects: NO_EFFECTS };
      }

      return {
        state: {
          status: state.attempt > 0 ? "reconnecting" : "connecting",
          synced: false,
          intentional: false,
          attempt: state.attempt,
        },
        effects: ["clear-reconnect-timer", "open-socket"],
      };
    }

    case "OPEN": {
      /* A socket that was already torn down cannot open; ignore a late event
         rather than resurrecting a dead connection. */
      if (state.status !== "connecting" && state.status !== "reconnecting") {
        return { state, effects: NO_EFFECTS };
      }

      return {
        state: {
          status: "connected",
          synced: false,
          intentional: false,
          // Successful connection resets the backoff.
          attempt: 0,
        },
        effects: ["send-sync-step-1", "send-full-awareness"],
      };
    }

    case "SYNCED": {
      if (state.status !== "connected" || state.synced) {
        return { state, effects: NO_EFFECTS };
      }

      return { state: { ...state, synced: true }, effects: NO_EFFECTS };
    }

    case "CLOSE": {
      if (state.intentional) {
        return {
          state: { ...state, status: "disconnected", synced: false },
          effects: ["detach-socket", "teardown-listeners"],
        };
      }

      return {
        state: {
          status: "reconnecting",
          synced: false,
          intentional: false,
          attempt: state.attempt + 1,
        },
        effects: ["detach-socket", "teardown-listeners", "schedule-reconnect"],
      };
    }

    case "ERROR": {
      /* Deliberately no state change and no reconnect: `close` always follows
         `error`, and letting both schedule a reconnect produced two sockets. */
      return { state, effects: ["report-error"] };
    }

    case "SOCKET_FAILED": {
      return {
        state: { ...state, status: "error", synced: false },
        effects: ["report-error"],
      };
    }

    case "DISCONNECT": {
      return {
        state: {
          status: "disconnected",
          synced: false,
          intentional: true,
          attempt: 0,
        },
        effects: [
          "clear-reconnect-timer",
          "close-socket",
          "teardown-listeners",
          "remove-local-awareness",
        ],
      };
    }

    case "DESTROY": {
      return {
        state: {
          status: "idle",
          synced: false,
          intentional: true,
          attempt: 0,
        },
        effects: [
          "clear-reconnect-timer",
          "close-socket",
          "teardown-listeners",
          "remove-local-awareness",
        ],
      };
    }

    default: {
      const exhaustive: never = event;
      throw new Error(`Unhandled connection event: ${String(exhaustive)}`);
    }
  }
}

/**
 * Full-jitter backoff for attempt `n` (1-based).
 *
 * Jitter is what stops a fleet of clients from reconnecting in lockstep when a
 * server restarts; `random` is injectable so the tests are deterministic.
 */
export function reconnectDelayMs(
  attempt: number,
  baseMs: number,
  maxMs: number,
  random: () => number = Math.random,
): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));

  return Math.round(exponential / 2 + random() * (exponential / 2));
}
