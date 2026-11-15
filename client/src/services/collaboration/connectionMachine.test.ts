import { describe, expect, it } from "vitest";

import {
  INITIAL_CONNECTION_STATE,
  reconnectDelayMs,
  transitionConnection,
  type ConnectionState,
} from "./connectionMachine";

/** Fold a list of events, returning the final state and every effect emitted. */
function run(...events: Parameters<typeof transitionConnection>[1][]) {
  let state: ConnectionState = INITIAL_CONNECTION_STATE;
  const effects: string[] = [];

  for (const event of events) {
    const result = transitionConnection(state, event);
    state = result.state;
    effects.push(...result.effects);
  }

  return { state, effects };
}

describe("connection machine — happy path", () => {
  it("starts idle", () => {
    expect(INITIAL_CONNECTION_STATE).toEqual({
      status: "idle",
      synced: false,
      intentional: false,
      attempt: 0,
    });
  });

  it("connect → connecting, and opens a socket", () => {
    const { state, effects } = run({ type: "CONNECT" });

    expect(state.status).toBe("connecting");
    expect(effects).toEqual(["clear-reconnect-timer", "open-socket"]);
  });

  it("open → connected, resets the backoff, sends the handshake", () => {
    const { state, effects } = run({ type: "CONNECT" }, { type: "OPEN" });

    expect(state.status).toBe("connected");
    expect(state.attempt).toBe(0);
    expect(effects).toContain("send-sync-step-1");
    expect(effects).toContain("send-full-awareness");
  });

  it("synced marks the document caught up without changing status", () => {
    const { state } = run(
      { type: "CONNECT" },
      { type: "OPEN" },
      { type: "SYNCED" },
    );

    expect(state.status).toBe("connected");
    expect(state.synced).toBe(true);
  });

  it("a second SYNCED is a no-op, so onSynced cannot fire twice", () => {
    const synced = run(
      { type: "CONNECT" },
      { type: "OPEN" },
      { type: "SYNCED" },
    ).state;

    const { state, effects } = transitionConnection(synced, { type: "SYNCED" });

    expect(state).toBe(synced);
    expect(effects).toEqual([]);
  });
});

describe("connection machine — the races", () => {
  it("ignores CONNECT while already connecting (no second socket)", () => {
    const connecting = run({ type: "CONNECT" }).state;
    const { state, effects } = transitionConnection(connecting, {
      type: "CONNECT",
    });

    expect(state).toBe(connecting);
    expect(effects).toEqual([]);
  });

  it("ignores CONNECT while connected", () => {
    const connected = run({ type: "CONNECT" }, { type: "OPEN" }).state;

    expect(
      transitionConnection(connected, { type: "CONNECT" }).effects,
    ).toEqual([]);
  });

  it("handles a close that arrives while still connecting", () => {
    const { state, effects } = run({ type: "CONNECT" }, { type: "CLOSE" });

    expect(state.status).toBe("reconnecting");
    expect(state.attempt).toBe(1);
    expect(effects).toContain("schedule-reconnect");
  });

  it("does not schedule two reconnects when error is followed by close", () => {
    const afterOpen = run({ type: "CONNECT" }, { type: "OPEN" }).state;

    const errored = transitionConnection(afterOpen, { type: "ERROR" });
    expect(errored.effects).toEqual(["report-error"]);
    expect(errored.state).toBe(afterOpen);

    const closed = transitionConnection(errored.state, { type: "CLOSE" });
    expect(
      closed.effects.filter((effect) => effect === "schedule-reconnect"),
    ).toHaveLength(1);
  });

  it("a close after disconnect does not reconnect", () => {
    const disconnected = run(
      { type: "CONNECT" },
      { type: "OPEN" },
      { type: "DISCONNECT" },
    ).state;

    const { state, effects } = transitionConnection(disconnected, {
      type: "CLOSE",
    });

    expect(state.status).toBe("disconnected");
    expect(effects).not.toContain("schedule-reconnect");
  });

  it("a close after destroy does not reconnect", () => {
    const destroyed = run({ type: "DESTROY" }).state;
    const { state } = transitionConnection(destroyed, { type: "CLOSE" });

    expect(state.status).toBe("disconnected");
  });

  it("ignores OPEN on a socket that was already torn down", () => {
    const disconnected = run({ type: "CONNECT" }, { type: "DISCONNECT" }).state;

    const { state, effects } = transitionConnection(disconnected, {
      type: "OPEN",
    });

    expect(state.status).toBe("disconnected");
    expect(effects).toEqual([]);
  });

  it("a socket that fails to construct lands in error, not connecting", () => {
    const { state, effects } = run(
      { type: "CONNECT" },
      { type: "SOCKET_FAILED" },
    );

    expect(state.status).toBe("error");
    expect(effects).toContain("report-error");
  });
});

describe("connection machine — backoff", () => {
  it("counts consecutive failures and grows the attempt number", () => {
    const first = run({ type: "CONNECT" }, { type: "CLOSE" }).state;
    const second = transitionConnection(first, { type: "CLOSE" }).state;
    const third = transitionConnection(second, { type: "CLOSE" }).state;

    expect(first.attempt).toBe(1);
    expect(second.attempt).toBe(2);
    expect(third.attempt).toBe(3);
  });

  it("shows 'reconnecting' rather than 'connecting' once it has failed", () => {
    const failedOnce = run({ type: "CONNECT" }, { type: "CLOSE" }).state;
    const { state } = transitionConnection(failedOnce, { type: "CONNECT" });

    expect(state.status).toBe("reconnecting");
    expect(state.attempt).toBe(1);
  });

  it("resets the attempt counter after a successful open", () => {
    const failed = run({ type: "CONNECT" }, { type: "CLOSE" }).state;
    const reconnecting = transitionConnection(failed, {
      type: "CONNECT",
    }).state;
    const { state } = transitionConnection(reconnecting, { type: "OPEN" });

    expect(state.attempt).toBe(0);
    expect(state.status).toBe("connected");
  });
});

describe("connection machine — teardown", () => {
  it("disconnect closes the socket, drops presence and stops retrying", () => {
    const connected = run({ type: "CONNECT" }, { type: "OPEN" }).state;
    const { state, effects } = transitionConnection(connected, {
      type: "DISCONNECT",
    });

    expect(state.status).toBe("disconnected");
    expect(state.intentional).toBe(true);
    expect(state.attempt).toBe(0);
    expect(effects).toEqual([
      "clear-reconnect-timer",
      "close-socket",
      "teardown-listeners",
      "remove-local-awareness",
    ]);
  });

  it("destroy returns to idle", () => {
    const { state } = run({ type: "CONNECT" }, { type: "DESTROY" });

    expect(state.status).toBe("idle");
    expect(state.synced).toBe(false);
  });

  it("clears the synced flag when the connection drops", () => {
    const synced = run(
      { type: "CONNECT" },
      { type: "OPEN" },
      { type: "SYNCED" },
    ).state;
    const dropped = transitionConnection(synced, { type: "CLOSE" }).state;

    expect(dropped.synced).toBe(false);
  });
});

describe("reconnectDelayMs", () => {
  it("stays within the jittered band for each attempt", () => {
    for (const attempt of [1, 2, 3, 4]) {
      const low = reconnectDelayMs(attempt, 1_000, 15_000, () => 0);
      const high = reconnectDelayMs(attempt, 1_000, 15_000, () => 1);
      const exponential = Math.min(15_000, 1_000 * 2 ** (attempt - 1));

      expect(low).toBe(Math.round(exponential / 2));
      expect(high).toBe(exponential);
    }
  });

  it("never exceeds the cap", () => {
    for (const attempt of [5, 10, 50]) {
      expect(reconnectDelayMs(attempt, 1_000, 15_000, () => 1)).toBe(15_000);
    }
  });
});
