import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bindState: vi.fn(),
  writeState: vi.fn(),
  flushReconciler: vi.fn(),
  bindRedisSync: vi.fn(),
  cleanupRedisRoom: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  yjsLogger: {
    info: mocks.info,
    warn: mocks.warn,
    error: mocks.error,
    debug: mocks.debug,
  },
}));

vi.mock(
  "../../../src/interfaces/websockets/collaboration/persistence/mongoPersistence",
  () => ({
    persistence: {
      bindState: mocks.bindState,
      writeState: mocks.writeState,
    },
  }),
);

vi.mock(
  "../../../src/interfaces/websockets/collaboration/persistence/redisSync",
  () => ({
    bindRedisSync: mocks.bindRedisSync,
    cleanupRedisRoom: mocks.cleanupRedisRoom,
  }),
);

vi.mock(
  "../../../src/interfaces/websockets/collaboration/persistence/boardReconciler",
  () => ({
    boardReconciler: {
      attach: vi.fn(),
      flush: mocks.flushReconciler,
    },
  }),
);

import { DocumentManager } from "../../../src/interfaces/websockets/collaboration/yjs/documentManager";

function client(id: string) {
  return {
    id,
    userId: "user-1",
    socket: { readyState: 1, OPEN: 1, send: vi.fn() },
  } as never;
}

describe("DocumentManager — lifecycle", () => {
  let manager: DocumentManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bindState.mockResolvedValue(undefined);
    mocks.writeState.mockResolvedValue(true);
    mocks.flushReconciler.mockResolvedValue(undefined);
    mocks.cleanupRedisRoom.mockResolvedValue(undefined);
    manager = new DocumentManager();
  });

  it("creates and registers an active document", async () => {
    const doc = await manager.getOrCreate("board-1");

    expect(doc.phase).toBe("active");
    expect(manager.get("board-1")).toBe(doc);
  });

  it("shares one document between concurrent callers", async () => {
    const [first, second] = await Promise.all([
      manager.getOrCreate("board-1"),
      manager.getOrCreate("board-1"),
    ]);

    expect(first).toBe(second);
    expect(mocks.bindState).toHaveBeenCalledTimes(1);
  });

  it("refuses clients the moment teardown starts, not when it ends", async () => {
    const doc = await manager.getOrCreate("board-1");

    /* Hold the flush open: this is the window in which the old code still
       reported `destroyed: false` and accepted new clients. */
    let releaseFlush: () => void = () => {};
    mocks.writeState.mockReturnValue(
      new Promise<boolean>((resolve) => {
        releaseFlush = () => resolve(true);
      }),
    );

    const teardown = manager.destroy("board-1");

    expect(doc.phase).toBe("destroying");
    expect(manager.addClient("board-1", client("c1"))).toBe(false);
    expect(manager.getClients("board-1")).toEqual([]);

    releaseFlush();
    await teardown;

    expect(doc.phase).toBe("destroyed");
    expect(manager.get("board-1")).toBeUndefined();
  });

  it("waits for an in-flight teardown before building a replacement", async () => {
    const original = await manager.getOrCreate("board-1");

    let releaseFlush: () => void = () => {};
    mocks.writeState.mockReturnValue(
      new Promise<boolean>((resolve) => {
        releaseFlush = () => resolve(true);
      }),
    );

    const teardown = manager.destroy("board-1");
    const replacementPromise = manager.getOrCreate("board-1");

    // Nothing has been created yet: the old document is still flushing.
    expect(mocks.bindState).toHaveBeenCalledTimes(1);

    releaseFlush();
    await teardown;

    const replacement = await replacementPromise;

    expect(replacement).not.toBe(original);
    expect(replacement.phase).toBe("active");
    expect(mocks.bindState).toHaveBeenCalledTimes(2);
  });

  it("joins a teardown already running instead of starting a second", async () => {
    await manager.getOrCreate("board-1");

    let releaseFlush: () => void = () => {};
    mocks.writeState.mockReturnValue(
      new Promise<boolean>((resolve) => {
        releaseFlush = () => resolve(true);
      }),
    );

    const first = manager.destroy("board-1");
    const second = manager.destroy("board-1");

    releaseFlush();

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(mocks.writeState).toHaveBeenCalledTimes(1);
  });

  it("hands the document back when teardown fails, so the sweep can retry", async () => {
    const doc = await manager.getOrCreate("board-1");

    mocks.writeState.mockRejectedValueOnce(new Error("mongo down"));

    await expect(manager.destroy("board-1")).resolves.toBe(false);

    expect(doc.phase).toBe("active");
    expect(manager.get("board-1")).toBe(doc);
    expect(mocks.error).toHaveBeenCalled();
  });
});
