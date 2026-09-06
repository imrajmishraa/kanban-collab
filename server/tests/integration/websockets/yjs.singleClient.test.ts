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
import { handleUpgrade } from "../../../src/interfaces/websockets/server/upgrade";
import { registerYWebSocket } from "../../../src/interfaces/websockets/server/yWebSocket";

import { connectionRegistry } from "../../../src/interfaces/websockets/collaboration/lifecycle/connectionRegistry";

import { documentManager } from "../../../src/interfaces/websockets/collaboration/yjs/documentManager";

import { CollaborationMessage } from "../../../src/interfaces/websockets/collaboration/yjs/protocol";

describe("Yjs Collaboration - Single Client", () => {
  let httpServer: http.Server;
  let wss: WebSocketServer;
  let ws: WebSocket | undefined;

  let wsUrl: string;

  const userId = "507f1f77bcf86cd799439011";
  const boardId = "507f1f77bcf86cd799439012";

  /*
   * ---------------------------------------------------------
   * Test server startup
   * ---------------------------------------------------------
   */

  beforeAll(async () => {
    httpServer = http.createServer();

    /*
     * This server is used only for WebSocket upgrades.
     * Disable HTTP timers because the test server does not
     * serve normal HTTP requests.
     */
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

        resolve();
      });
    });

    const address = httpServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Failed to determine test server address.");
    }

    const token = signAccessToken({
      userId,
      email: "user@example.com",
      fullName: "Test User",
    });

    wsUrl =
      `ws://127.0.0.1:${address.port}` +
      `/ws?boardId=${boardId}&token=${token}`;
  });

  /*
   * ---------------------------------------------------------
   * Test isolation
   * ---------------------------------------------------------
   */

  beforeEach(() => {
    documentManager.clear();
    connectionRegistry.clear();
  });

  /*
   * ---------------------------------------------------------
   * Client cleanup after every test
   * ---------------------------------------------------------
   */

  afterEach(async () => {
    const client = ws;

    ws = undefined;

    if (!client) {
      documentManager.clear();
      connectionRegistry.clear();

      return;
    }

    if (client.readyState === WebSocket.OPEN) {
      await new Promise<void>((resolve) => {
        const handleClose = () => {
          client.off("error", handleError);

          resolve();
        };

        const handleError = () => {
          /*
           * The close event normally follows even when the
           * socket reports an error. We intentionally wait
           * for close to guarantee server-side cleanup.
           */
        };

        client.once("close", handleClose);

        client.once("error", handleError);

        client.close();
      });
    } else if (client.readyState === WebSocket.CONNECTING) {
      await new Promise<void>((resolve) => {
        const handleClose = () => {
          resolve();
        };

        const handleError = () => {
          /*
           * Ignore here. The close event performs cleanup.
           */
        };

        client.once("close", handleClose);

        client.once("error", handleError);

        client.close();
      });
    }

    client.removeAllListeners();

    /*
     * Give the WebSocket server close handler a turn to
     * unregister the collaboration client.
     */
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    documentManager.clear();
    connectionRegistry.clear();
  });

  /*
   * ---------------------------------------------------------
   * Test server shutdown
   * ---------------------------------------------------------
   */

  afterAll(async () => {
    /*
     * Close all active WebSocket clients first.
     */
    for (const client of wss.clients) {
      client.terminate();
    }

    /*
     * Wait until the WebSocket server has finished closing.
     */
    await new Promise<void>((resolve) => {
      if (wss.clients.size === 0) {
        wss.close(() => resolve());
        return;
      }

      wss.close(() => resolve());
    });

    /*
     * Destroy any remaining HTTP connections.
     *
     * closeAllConnections() is available in modern Node.js
     * and guarantees that upgraded/idle connections do not
     * keep the test process alive.
     */
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
   * Test 1
   * ---------------------------------------------------------
   */

  it("should connect a single client and initialize a Yjs document", async () => {
    ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for WebSocket connection."));
      }, 5000);

      ws!.once("open", () => {
        clearTimeout(timeout);
        resolve();
      });

      ws!.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    const managedDocument = documentManager.get(boardId);

    expect(managedDocument).toBeDefined();

    expect(managedDocument?.name).toBe(boardId);

    expect(managedDocument?.doc).toBeInstanceOf(Y.Doc);

    expect(managedDocument?.loaded).toBe(true);

    expect(managedDocument?.destroyed).toBe(false);

    expect(managedDocument?.connectionCount).toBe(1);

    expect(managedDocument?.clients.size).toBe(1);

    expect(connectionRegistry.getConnectionCount()).toBe(1);

    const boardConnections = connectionRegistry.getBoardConnections(boardId);

    expect(boardConnections).toHaveLength(1);

    expect(boardConnections[0]?.userId).toBe(userId);

    expect(boardConnections[0]?.boardId).toBe(boardId);
  });

  /*
   * ---------------------------------------------------------
   * Test 2
   * ---------------------------------------------------------
   */

  it("should receive the initial Yjs synchronization message", async () => {
    ws = new WebSocket(wsUrl);

    const message = await new Promise<Buffer>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            "Timed out waiting for initial Yjs synchronization message.",
          ),
        );
      }, 5000);

      ws!.once("message", (data, isBinary) => {
        clearTimeout(timeout);

        if (!isBinary) {
          reject(new Error("Expected a binary Yjs message."));

          return;
        }

        if (Buffer.isBuffer(data)) {
          resolve(data);
          return;
        }

        if (data instanceof ArrayBuffer) {
          resolve(Buffer.from(new Uint8Array(data)));

          return;
        }

        resolve(Buffer.concat(data));
      });

      ws!.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    expect(message.length).toBeGreaterThan(1);

    /*
     * The first varUint is the application's
     * top-level collaboration message type.
     */
    const decoder = decoding.createDecoder(message);

    const messageType = decoding.readVarUint(decoder);

    expect(messageType).toBe(CollaborationMessage.Sync);

    /*
     * Everything after the application-level
     * message type belongs to the official
     * Yjs synchronization protocol.
     */
    const syncPayload = message.subarray(decoder.pos);

    expect(syncPayload.length).toBeGreaterThan(0);

    /*
     * A Yjs synchronization message begins
     * with a protocol message type.
     */
    const syncDecoder = decoding.createDecoder(syncPayload);

    expect(() => {
      decoding.readVarUint(syncDecoder);
    }).not.toThrow();
  });

  /*
   * ---------------------------------------------------------
   * Test 3
   * ---------------------------------------------------------
   */

  it("should remove the client from the document when disconnected", async () => {
    ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for WebSocket connection."));
      }, 5000);

      ws!.once("open", () => {
        clearTimeout(timeout);
        resolve();
      });

      ws!.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    const managedDocument = documentManager.get(boardId);

    expect(managedDocument).toBeDefined();

    expect(managedDocument?.connectionCount).toBe(1);

    expect(managedDocument?.clients.size).toBe(1);

    expect(connectionRegistry.getConnectionCount()).toBe(1);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for WebSocket close."));
      }, 5000);

      ws!.once("close", () => {
        clearTimeout(timeout);
        resolve();
      });

      ws!.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      ws!.close();
    });

    /*
     * Give the server close handler a turn to finish
     * removing the collaboration client.
     */
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    expect(documentManager.get(boardId)?.connectionCount ?? 0).toBe(0);

    expect(documentManager.get(boardId)?.clients.size ?? 0).toBe(0);

    expect(connectionRegistry.getConnectionCount()).toBe(0);
  });
});
