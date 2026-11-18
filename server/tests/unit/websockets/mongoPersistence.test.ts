import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";

const { findOneAndUpdate, findOne, warn, error, debug, info } = vi.hoisted(
  () => ({
    findOneAndUpdate: vi.fn(),
    findOne: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
);

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  YjsUpdateModel: { findOne, findOneAndUpdate },
}));

vi.mock("../../../src/config/websocket", () => ({
  websocketConfig: { persistenceDebounceMs: 10 },
}));

vi.mock("../../../src/infrastructure/logging/logger", () => ({
  logger: { info, warn, error, debug },
}));

import { MongoPersistence } from "../../../src/interfaces/websockets/collaboration/persistence/mongoPersistence";

function makeDoc(): Y.Doc {
  const doc = new Y.Doc();
  doc.getText("t").insert(0, "hello");
  return doc;
}

describe("MongoPersistence — a failed write is retried, not forgotten", () => {
  let persistence: MongoPersistence;

  beforeEach(() => {
    vi.useFakeTimers();
    findOne.mockReset().mockReturnValue({ lean: async () => null });
    findOneAndUpdate.mockReset();
    warn.mockReset();
    error.mockReset();
    persistence = new MongoPersistence();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writeState reports failure instead of swallowing it", async () => {
    findOneAndUpdate.mockRejectedValueOnce(new Error("mongo down"));

    await expect(persistence.writeState("board-1", makeDoc())).resolves.toBe(
      false,
    );
    expect(error).toHaveBeenCalled();
  });

  it("writeState reports success", async () => {
    findOneAndUpdate.mockResolvedValueOnce({});

    await expect(persistence.writeState("board-1", makeDoc())).resolves.toBe(
      true,
    );
  });

  it("schedules a retry after a failed write and stops once it succeeds", async () => {
    const doc = makeDoc();
    await persistence.bindState("board-1", doc);

    findOneAndUpdate
      .mockRejectedValueOnce(new Error("mongo down"))
      .mockResolvedValueOnce({});

    // An edit schedules the debounced write.
    doc.getText("t").insert(0, "!");
    await vi.advanceTimersByTimeAsync(10);

    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ documentName: "board-1", attempt: 1 }),
      expect.stringContaining("scheduling a retry"),
    );

    // First retry, 500 ms later, succeeds.
    await vi.advanceTimersByTimeAsync(500);

    expect(findOneAndUpdate).toHaveBeenCalledTimes(2);

    // One error for the failed attempt, and no give-up.
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("Giving up"),
    );
  });

  it("gives up after the attempt budget and says the state is only in memory", async () => {
    const doc = makeDoc();
    await persistence.bindState("board-1", doc);

    findOneAndUpdate.mockRejectedValue(new Error("mongo down"));

    doc.getText("t").insert(0, "!");
    await vi.advanceTimersByTimeAsync(10);

    // 500 + 1000 + 2000 ms of backoff across the remaining attempts.
    await vi.advanceTimersByTimeAsync(4_000);

    expect(findOneAndUpdate).toHaveBeenCalledTimes(4);
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ documentName: "board-1", attempts: 4 }),
      expect.stringContaining("Giving up"),
    );
  });

  it("coalesces a burst of edits into one write", async () => {
    const doc = makeDoc();
    await persistence.bindState("board-1", doc);

    findOneAndUpdate.mockResolvedValue({});

    const text = doc.getText("t");
    text.insert(0, "a");
    await vi.advanceTimersByTimeAsync(3);
    text.insert(0, "b");
    await vi.advanceTimersByTimeAsync(3);
    text.insert(0, "c");
    await vi.advanceTimersByTimeAsync(20);

    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it("flush cancels a pending retry and warns when the final write fails", async () => {
    const doc = makeDoc();
    await persistence.bindState("board-1", doc);

    findOneAndUpdate.mockRejectedValue(new Error("mongo down"));

    doc.getText("t").insert(0, "!");
    await vi.advanceTimersByTimeAsync(10);

    const before = findOneAndUpdate.mock.calls.length;

    await persistence.flush("board-1", doc);

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ documentName: "board-1" }),
      expect.stringContaining("only in memory"),
    );

    // The pending retry was cancelled, so nothing else fires.
    await vi.advanceTimersByTimeAsync(5_000);
    expect(findOneAndUpdate).toHaveBeenCalledTimes(before + 1);
  });
});
