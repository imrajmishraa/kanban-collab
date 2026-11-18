import { describe, expect, it } from "vitest";

import {
  NEW_CONNECTION,
  isClosed,
  transitionConnectionPhase,
  type ConnectionPhase,
} from "../../../src/interfaces/websockets/collaboration/lifecycle/connectionPhase";

/** Fold events from a starting phase, collecting every effect. */
function run(
  from: ConnectionPhase,
  ...events: Parameters<typeof transitionConnectionPhase>[1][]
) {
  let phase = from;
  const effects: string[] = [];

  for (const event of events) {
    const result = transitionConnectionPhase(phase, event);
    phase = result.phase;
    effects.push(...result.effects);
  }

  return { phase, effects };
}

describe("connection phase — happy path", () => {
  it("starts new and walks new → registered → ready", () => {
    expect(NEW_CONNECTION).toBe("new");

    expect(run("new", { type: "REGISTERED" }).phase).toBe("registered");
    expect(run("new", { type: "REGISTERED" }, { type: "READY" }).phase).toBe(
      "ready",
    );
  });

  it("neither registration nor readiness has side effects", () => {
    expect(run("new", { type: "REGISTERED" }).effects).toEqual([]);
    expect(
      run("new", { type: "REGISTERED" }, { type: "READY" }).effects,
    ).toEqual([]);
  });
});

describe("connection phase — teardown from each phase", () => {
  it("from new there is nothing to undo", () => {
    expect(run("new", { type: "CLOSED" })).toEqual({
      phase: "closed",
      effects: [],
    });
  });

  it("from registered only the registry entry is undone", () => {
    expect(run("registered", { type: "CLOSED" })).toEqual({
      phase: "closed",
      effects: ["unregister"],
    });
  });

  it("from ready everything is undone, registry last", () => {
    expect(run("ready", { type: "CLOSED" })).toEqual({
      phase: "closed",
      effects: [
        "detach-client",
        "clear-awareness",
        "schedule-idle-cleanup",
        "unregister",
      ],
    });
  });

  it("is idempotent: a second close does nothing", () => {
    const closed = run("ready", { type: "CLOSED" });
    const again = transitionConnectionPhase(closed.phase, { type: "CLOSED" });

    expect(again.phase).toBe("closed");
    expect(again.effects).toEqual([]);
  });

  it("close then close from every phase runs the effects once", () => {
    for (const phase of ["new", "registered", "ready"] as const) {
      const { effects } = run(phase, { type: "CLOSED" }, { type: "CLOSED" });

      expect(
        effects.filter((effect) => effect === "unregister").length,
      ).toBeLessThanOrEqual(1);
    }
  });
});

describe("connection phase — the cases the flags got wrong", () => {
  it("a close that arrives before registration does not unregister", () => {
    // The old `registered` boolean existed only to make this safe by hand.
    expect(run("new", { type: "CLOSED" }).effects).toEqual([]);
  });

  it("READY is ignored when the connection never registered", () => {
    const result = transitionConnectionPhase("new", { type: "READY" });

    expect(result.phase).toBe("new");
    expect(result.effects).toEqual([]);
  });

  it("a second REGISTERED is ignored, so the registry keeps one entry", () => {
    const result = transitionConnectionPhase("registered", {
      type: "REGISTERED",
    });

    expect(result.phase).toBe("registered");
  });

  it("READY after close is ignored", () => {
    expect(transitionConnectionPhase("closed", { type: "READY" }).phase).toBe(
      "closed",
    );
  });

  it("reports closed for the terminal phase only", () => {
    expect(isClosed("closed")).toBe(true);
    expect(isClosed("ready")).toBe(false);
  });
});
