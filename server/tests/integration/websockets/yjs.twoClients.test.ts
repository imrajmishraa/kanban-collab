import http from "node:http";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import * as Y from "yjs";
import WebSocket, { WebSocketServer } from "ws";

jest.mock(
  "../../../src/interfaces/websockets/collaboration/persistence/mongoPersistence",
  () => ({
    persistence: {
      bindState: jest.fn(async (_documentName: string, _document: Y.Doc) => {
        // Persistence is intentionally disabled for this protocol test.
      }),

      writeState: jest.fn(async (_documentName: string, _document: Y.Doc) => {
        // Persistence is tested separately.
      }),
    },
  }),
);

jest.mock(
  "../../../src/interfaces/websockets/collaboration/persistence/redisSync",
  () => ({
    bindRedisSync: jest.fn((_documentName: string, _document: Y.Doc) => {
      // Redis synchronization is tested separately.
    }),

    cleanupRedisRoom: jest.fn(async (_documentName: string) => {
      // Redis synchronization is tested separately.
    }),
  }),
);

jest.mock(
  "../../../src/interfaces/websockets/middlewares/authorize",
  () => ({
    authorize: jest.fn(async () => {
      // Board authorization is tested separately.
    }),
  }),
);

import { signAccessToken } from "../../../src/infrastructure/security/token";
import { connectionRegistry } from "../../../src/interfaces/websockets/collaboration/lifecycle/connectionRegistry";
import { documentManager } from "../../../src/interfaces/websockets/collaboration/yjs/documentManager";
import { CollaborationMessage } from "../../../src/interfaces/websockets/collaboration/yjs/protocol";
import { collaborationMessageDecoder } from "../../../src/interfaces/websockets/collaboration/yjs/collaborationMessageDecoder";
import { collaborationMessageEncoder } from "../../../src/interfaces/websockets/collaboration/yjs/collaborationMessageEncoder";
import { handleUpgrade } from "../../../src/interfaces/websockets/server/upgrade";
import { registerYWebSocket } from "../../../src/interfaces/websockets/server/yWebSocket";

describe("Yjs Collaboration - Two Clients", () => {
  let httpServer: http.Server;
  let wss: WebSocketServer;
  let port: number;

  let wsA: WebSocket | undefined;
  let wsB: WebSocket | undefined;

  const boardId = "507f1f77bcf86cd799439012";

  const userIdA = "507f1f77bcf86cd799439011";

  const userIdB = "507f1f77bcf86cd799439013";

  /*
   * ---------------------------------------------------------
   * Test helpers
   * ---------------------------------------------------------
   */

  function createWebSocket(userId: string): WebSocket {
    const token = signAccessToken({
      userId,
      email: `${userId}@example.com`,
      fullName: `User ${userId}`,
    });

    return new WebSocket(
      `ws://127.0.0.1:${port}/ws?boardId=${boardId}&token=${token}`,
    );
  }

  async function waitForOpen(socket: WebSocket): Promise<void> {
    if (socket.readyState === WebSocket.OPEN) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const handleOpen = () => {
        cleanup();
        resolve();
      };

      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const handleClose = (
        code: number,
        reason: Buffer,
      ) => {
        cleanup();

        reject(
          new Error(
            `WebSocket closed before opening. code=${code} reason=${reason.toString()}`,
          ),
        );
      };

      const cleanup = () => {
        socket.off("open", handleOpen);
        socket.off("error", handleError);
        socket.off("close", handleClose);
      };

      socket.once("open", handleOpen);
      socket.once("error", handleError);
      socket.once("close", handleClose);
    });
  }

  function rawDataToBuffer(data: WebSocket.RawData): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(new Uint8Array(data));
    }

    return Buffer.concat(data);
  }

  /**
   * Waits for the initial Yjs synchronization message.
   *
   * The server sends a CollaborationMessage.Sync containing
   * a Yjs Sync Step 1 payload immediately after connection.
   *
   * We process that message using a real Y.Doc so that the
   * client-side protocol state is correctly represented.
   */
  async function waitForInitialSync(
    socket: WebSocket,
    document: Y.Doc,
    timeoutMs = 5000,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();

        reject(
          new Error(
            "Timed out waiting for initial Yjs synchronization.",
          ),
        );
      }, timeoutMs);

      const handleMessage = (
        data: WebSocket.RawData,
        isBinary: boolean,
      ) => {
        if (!isBinary) {
          return;
        }

        const message = rawDataToBuffer(data);

        if (message.length === 0) {
          return;
        }

        try {
          const decoder = decoding.createDecoder(message);
          const type = decoding.readVarUint(decoder);

          if (type !== CollaborationMessage.Sync) {
            return;
          }

          const syncPayload = message.subarray(decoder.pos);

          if (syncPayload.length === 0) {
            return;
          }

          const syncDecoder = decoding.createDecoder(syncPayload);
          const responseEncoder = encoding.createEncoder();

          ySyncProtocol.readSyncMessage(
            syncDecoder,
            responseEncoder,
            document,
            "two-client-integration-test",
          );

          /*
           * The server's initial message is expected to be
           * Sync Step 1.
           *
           * A real client would normally send the generated
           * Sync Step 2 response back to the server.
           *
           * For this integration test, the important part is
           * that the client can successfully decode the initial
           * server synchronization message.
           */

          cleanup();
          resolve();
        } catch {
          /*
           * Ignore messages that are not valid Yjs sync
           * messages for this helper.
           */
        }
      };

      const handleClose = (
        code: number,
        reason: Buffer,
      ) => {
        cleanup();

        reject(
          new Error(
            `WebSocket closed before initial Yjs synchronization. code=${code} reason=${reason.toString()}`,
          ),
        );
      };

      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        clearTimeout(timeout);

        socket.off("message", handleMessage);
        socket.off("close", handleClose);
        socket.off("error", handleError);
      };

      socket.on("message", handleMessage);
      socket.once("close", handleClose);
      socket.once("error", handleError);
    });
  }

  /**
   * Waits for a Yjs update from the server.
   *
   * Important:
   *
   * We do NOT assume that every Sync message is an update.
   * The server can send:
   *
   *   Sync Step 1
   *   Sync Step 2
   *   Update
   *
   * Therefore we inspect the Yjs message type before
   * resolving the promise.
   */
  async function waitForYjsUpdate(
    socket: WebSocket,
    document: Y.Doc,
    timeoutMs = 5000,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();

        reject(
          new Error(
            "Timed out waiting for Yjs update.",
          ),
        );
      }, timeoutMs);

      const handleMessage = (
        data: WebSocket.RawData,
        isBinary: boolean,
      ) => {
        if (!isBinary) {
          return;
        }

        const message = rawDataToBuffer(data);

        if (message.length === 0) {
          return;
        }

        try {
          const decoder = decoding.createDecoder(message);
          const type = decoding.readVarUint(decoder);

          if (type !== CollaborationMessage.Sync) {
            return;
          }

          const syncPayload = message.subarray(decoder.pos);

          if (syncPayload.length === 0) {
            return;
          }

          /*
           * Decode the Yjs sync message first.
           *
           * We need to determine whether this is an actual
           * Update message or merely a synchronization handshake.
           */
          const syncDecoder = decoding.createDecoder(syncPayload);

          const messageType = decoding.readVarUint(syncDecoder);

          /*
           * y-protocols/sync message types:
           *
           *   0 = SyncStep1
           *   1 = SyncStep2
           *   2 = Update
           *
           * We only resolve for Update.
           */
          if (messageType !== 2) {
            return;
          }

          const updateDecoder = decoding.createDecoder(syncPayload);

          const responseEncoder = encoding.createEncoder();

          ySyncProtocol.readSyncMessage(
            updateDecoder,
            responseEncoder,
            document,
            "two-client-integration-test",
          );

          cleanup();
          resolve();
        } catch {
          /*
           * Ignore malformed/unrelated messages and continue
           * waiting until the timeout.
           */
        }
      };

      const handleClose = (
        code: number,
        reason: Buffer,
      ) => {
        cleanup();

        reject(
          new Error(
            `WebSocket closed before Yjs update arrived. code=${code} reason=${reason.toString()}`,
          ),
        );
      };

      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        clearTimeout(timeout);

        socket.off("message", handleMessage);
        socket.off("close", handleClose);
        socket.off("error", handleError);
      };

      socket.on("message", handleMessage);
      socket.once("close", handleClose);
      socket.once("error", handleError);
    });
  }

  /**
   * Creates a real Yjs update on a client-side document.
   *
   * This function intentionally does NOT interact with the
   * server-side persistence layer.
   *
   * Flow:
   *
   *   Y.Doc mutation
   *        ↓
   *   Yjs update Uint8Array
   *        ↓
   *   y-protocols Sync Update
   *        ↓
   *   application CollaborationMessage.Sync
   *        ↓
   *   WebSocket
   */
  function createYjsUpdateMessage(
    document: Y.Doc,
    key: string,
    value: string,
  ): Buffer {
    let generatedUpdate: Uint8Array | undefined;

    const updateListener = (update: Uint8Array) => {
      generatedUpdate = update;
    };

    document.once("update", updateListener);

    try {
      document.getMap("board").set(key, value);
    } finally {
      document.off("update", updateListener);
    }

    if (!generatedUpdate) {
      throw new Error(
        "Yjs document did not generate an update.",
      );
    }

    /*
     * Encode the raw Yjs update using the official Yjs
     * synchronization protocol.
     *
     * This produces:
     *
     *   [Sync message type = Update]
     *   [Yjs update]
     */
    const syncEncoder = encoding.createEncoder();

    ySyncProtocol.writeUpdate(
      syncEncoder,
      generatedUpdate,
    );

    const syncPayload =
      encoding.toUint8Array(syncEncoder);

    /*
     * Wrap the Yjs sync payload in the application's
     * collaboration protocol.
     */
    return Buffer.from(
      collaborationMessageEncoder.encode(
        CollaborationMessage.Sync,
        syncPayload,
      ),
    );
  }

  /**
   * Waits for a socket to close.
   */
  async function closeSocket(
    socket: WebSocket | undefined,
  ): Promise<void> {
    if (!socket) {
      return;
    }

    if (socket.readyState === WebSocket.CLOSED) {
      return;
    }

    await new Promise<void>((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);
        resolve();
      };

      const timeout = setTimeout(() => {
        try {
          socket.terminate();
        } finally {
          finish();
        }
      }, 1000);

      socket.once("close", finish);

      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        socket.close();
      } else {
        finish();
      }
    });
  }

  /**
   * Waits until the document has the expected number
   * of connections.
   *
   * This avoids racing the WebSocket connection handler.
   */
  async function waitForConnectionCount(
    documentName: string,
    expectedCount: number,
    timeoutMs = 2000,
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const managed =
        documentManager.get(documentName);

      if (
        managed &&
        managed.connectionCount === expectedCount
      ) {
        return;
      }

      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });
    }

    const managed = documentManager.get(documentName);

    throw new Error(
      `Timed out waiting for ${expectedCount} WebSocket connections. ` +
        `Actual connection count: ${
          managed?.connectionCount ?? 0
        }.`,
    );
  }

  /*
   * ---------------------------------------------------------
   * Server setup
   * ---------------------------------------------------------
   */

  beforeAll(async () => {
    httpServer = http.createServer();

    httpServer.requestTimeout = 0;
    httpServer.timeout = 0;
    httpServer.keepAliveTimeout = 0;
    httpServer.headersTimeout = 0;

    wss = new WebSocketServer({
      noServer: true,
      maxPayload: 1024 * 1024,
    });

    registerYWebSocket(wss);

    httpServer.on("upgrade", (request, socket, head) => {
      void handleUpgrade(request, socket, head, wss);
    });

    await new Promise<void>((resolve, reject) => {
      const handleError = (error: Error) => {
        httpServer.off("error", handleError);
        reject(error);
      };

      httpServer.once("error", handleError);

      httpServer.listen(0, "127.0.0.1", () => {
        httpServer.off("error", handleError);

        const address = httpServer.address();

        if (!address || typeof address === "string") {
          reject(new Error("Failed to determine test server port."));
          return;
        }

        port = address.port;
        resolve();
      });
    });
  });

  /*
   * ---------------------------------------------------------
   * Per-test setup
   * ---------------------------------------------------------
   */

  beforeEach(() => {
    documentManager.clear();
    connectionRegistry.clear();
  });

  /*
   * ---------------------------------------------------------
   * Per-test cleanup
   * ---------------------------------------------------------
   */

  afterEach(async () => {
    await Promise.all([closeSocket(wsA), closeSocket(wsB)]);

    wsA = undefined;
    wsB = undefined;

    documentManager.clear();
    connectionRegistry.clear();
  });

  /*
   * ---------------------------------------------------------
   * Server cleanup
   * ---------------------------------------------------------
   */

  afterAll(async () => {
    await Promise.all([closeSocket(wsA), closeSocket(wsB)]);

    wsA = undefined;
    wsB = undefined;

    for (const client of wss.clients) {
      client.terminate();
    }

    await new Promise<void>((resolve) => {
      wss.close(() => resolve());
    });

    if (httpServer.listening) {
      httpServer.closeAllConnections();

      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    httpServer.unref();

    documentManager.clear();
    connectionRegistry.clear();
  });

  /*
   * ---------------------------------------------------------
   * Tests
   * ---------------------------------------------------------
   */

  it(
    "should connect two clients to the same Yjs document",
    async () => {
      const clientDocumentA = new Y.Doc();
      const clientDocumentB = new Y.Doc();

      wsA = createWebSocket(userIdA);
      const syncA = waitForInitialSync(wsA, clientDocumentA);

      wsB = createWebSocket(userIdB);
      const syncB = waitForInitialSync(wsB, clientDocumentB);

      /*
       * Both clients must be open and initial sync received
       * before we inspect the document manager.
       */
      await Promise.all([
        waitForOpen(wsA),
        waitForOpen(wsB),
        syncA,
        syncB,
      ]);

      /*
       * Wait for the server-side connection registry to
       * observe both clients.
       */
      await waitForConnectionCount(
        boardId,
        2,
      );

      const managedDocument =
        documentManager.get(boardId);

      expect(managedDocument).toBeDefined();

      expect(
        managedDocument?.connectionCount,
      ).toBe(2);

      expect(
        managedDocument?.clients.size,
      ).toBe(2);
    },
    10000,
  );

  it(
    "should synchronize an update from client A to client B",
    async () => {
      const clientDocumentA = new Y.Doc();
      const clientDocumentB = new Y.Doc();

      wsA = createWebSocket(userIdA);
      const syncA = waitForInitialSync(wsA, clientDocumentA);

      wsB = createWebSocket(userIdB);
      const syncB = waitForInitialSync(wsB, clientDocumentB);

      await Promise.all([
        waitForOpen(wsA),
        waitForOpen(wsB),
        syncA,
        syncB,
      ]);

      await waitForConnectionCount(
        boardId,
        2,
      );

      /*
       * Register B's update listener BEFORE sending A's
       * update. This prevents a race condition.
       */
      const updatePromise =
        waitForYjsUpdate(
          wsB,
          clientDocumentB,
        );

      /*
       * Create a genuine Yjs update locally on A.
       */
      const message =
        createYjsUpdateMessage(
          clientDocumentA,
          "title",
          "Client A update",
        );

      /*
       * Send the application-level collaboration message.
       */
      wsA.send(message);

      /*
       * Wait for the server to broadcast the update to B.
       */
      await updatePromise;

      expect(
        clientDocumentB
          .getMap("board")
          .get("title"),
      ).toBe("Client A update");
    },
    10000,
  );

  it(
    "should synchronize an update from client B to client A",
    async () => {
      const clientDocumentA = new Y.Doc();
      const clientDocumentB = new Y.Doc();

      wsA = createWebSocket(userIdA);
      const syncA = waitForInitialSync(wsA, clientDocumentA);

      wsB = createWebSocket(userIdB);
      const syncB = waitForInitialSync(wsB, clientDocumentB);

      await Promise.all([
        waitForOpen(wsA),
        waitForOpen(wsB),
        syncA,
        syncB,
      ]);

      await waitForConnectionCount(
        boardId,
        2,
      );

      /*
       * Listen on A before sending B's update.
       */
      const updatePromise =
        waitForYjsUpdate(
          wsA,
          clientDocumentA,
        );

      /*
       * Create a real Yjs update on B.
       */
      const message =
        createYjsUpdateMessage(
          clientDocumentB,
          "description",
          "Client B update",
        );

      wsB.send(message);

      /*
       * Wait for server broadcast.
       */
      await updatePromise;

      expect(
        clientDocumentA
          .getMap("board")
          .get("description"),
      ).toBe("Client B update");
    },
    10000,
  );

  it(
    "should remove both clients after disconnect",
    async () => {
      const clientDocumentA = new Y.Doc();
      const clientDocumentB = new Y.Doc();

      wsA = createWebSocket(userIdA);
      const syncA = waitForInitialSync(wsA, clientDocumentA);

      wsB = createWebSocket(userIdB);
      const syncB = waitForInitialSync(wsB, clientDocumentB);

      await Promise.all([
        waitForOpen(wsA),
        waitForOpen(wsB),
        syncA,
        syncB,
      ]);

      await waitForConnectionCount(
        boardId,
        2,
      );

      const managedDocument =
        documentManager.get(boardId);

      expect(managedDocument).toBeDefined();

      expect(
        managedDocument?.connectionCount,
      ).toBe(2);

      /*
       * Close A first.
       */
      await closeSocket(wsA);
      wsA = undefined;

      /*
       * Wait until the server observes A's disconnect.
       */
      await waitForConnectionCount(
        boardId,
        1,
      );

      /*
       * Close B.
       */
      await closeSocket(wsB);
      wsB = undefined;

      /*
       * Wait until the server observes B's disconnect.
       */
      await waitForConnectionCount(
        boardId,
        0,
      );

      const documentAfterClose =
        documentManager.get(boardId);

      expect(
        documentAfterClose,
      ).toBeDefined();

      expect(
        documentAfterClose?.connectionCount,
      ).toBe(0);

      expect(
        documentAfterClose?.clients.size,
      ).toBe(0);
    },
    10000,
  );
});

