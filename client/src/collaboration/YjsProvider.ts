/**
 * YjsProvider — WebSocket transport for Yjs document sync
 * and awareness, matching the server collaboration protocol.
 *
 * Message framing (identical to server):
 *
 *   [varUint type][payload…]
 *
 *   type 0 → Sync      (y-protocols/sync)
 *   type 1 → Awareness (y-protocols/awareness)
 *
 * Origin rules:
 *   - Document updates that originated from the network use
 *     origin `"remote"` so they are not echoed back.
 *   - Awareness updates from the network use origin `"remote"`.
 */

import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

import {
  applyAwarenessUpdate,
  createAwareness,
  encodeAwarenessUpdate,
  encodeFullAwarenessUpdate,
  removeLocalAwareness,
  setLocalUser,
  subscribeToPeers,
  type AwarenessUser,
} from "./awareness";
import {
  CollaborationMessage,
  applySyncMessage,
  decodeCollaborationMessage,
  encodeCollaborationMessage,
  encodeSyncStep1,
  encodeSyncUpdate,
  type CollaborationMessageType,
} from "./syncProtocol";

export type ProviderStatus =
  "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface YjsProviderOptions {
  /** Full WebSocket URL (including auth / room query params). */
  url: string;
  /** Local user identity for awareness. */
  user: AwarenessUser;
  /** Optional existing Y.Doc (a new one is created otherwise). */
  doc?: Y.Doc;
  /** Called whenever connection status changes. */
  onStatus?: (status: ProviderStatus) => void;
  /** Called when remote peer list changes. */
  onPeers?: (peers: AwarenessUser[]) => void;
  /** Called on unrecoverable errors. */
  onError?: (error: Error) => void;
}

/**
 * Ensure a Uint8Array is backed by a plain ArrayBuffer so it
 * satisfies WebSocket.send's BufferSource constraint under
 * TypeScript's stricter ArrayBufferLike typing (SharedArrayBuffer).
 */
function toSendBuffer(data: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy;
}

export class YjsProvider {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  private readonly url: string;
  private readonly user: AwarenessUser;
  private readonly onStatus?: (status: ProviderStatus) => void;
  private readonly onPeers?: (peers: AwarenessUser[]) => void;
  private readonly onError?: (error: Error) => void;

  private ws: WebSocket | null = null;
  private status: ProviderStatus = "idle";
  private intentionalClose = false;
  private peersUnsub: (() => void) | null = null;

  private readonly boundDocUpdate: (
    update: Uint8Array,
    origin: unknown,
  ) => void;
  private readonly boundAwarenessUpdate: (
    changes: {
      added: number[];
      updated: number[];
      removed: number[];
    },
    origin: unknown,
  ) => void;

  constructor(options: YjsProviderOptions) {
    this.url = options.url;
    this.user = options.user;
    this.onStatus = options.onStatus;
    this.onPeers = options.onPeers;
    this.onError = options.onError;

    this.doc = options.doc ?? new Y.Doc();
    this.awareness = createAwareness(this.doc, options.user);

    this.boundDocUpdate = this.handleDocUpdate.bind(this);
    this.boundAwarenessUpdate = this.handleAwarenessUpdate.bind(this);
  }

  /** Current connection status. */
  getStatus(): ProviderStatus {
    return this.status;
  }

  /** Open the WebSocket and start syncing. */
  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.intentionalClose = false;
    this.setStatus("connecting");

    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      // A malformed URL makes `new WebSocket` throw synchronously. Surface it
      // as an error status instead of letting it escape the caller (which, from
      // a React effect, would repeat on every render).
      const error = err instanceof Error ? err : new Error(String(err));
      this.onError?.(error);
      this.setStatus("error");
      return;
    }

    ws.binaryType = "arraybuffer";
    this.ws = ws;

    this.doc.on("update", this.boundDocUpdate);
    this.awareness.on("update", this.boundAwarenessUpdate);

    if (this.onPeers) {
      this.peersUnsub = subscribeToPeers(this.awareness, this.onPeers);
    }

    ws.onopen = () => {
      this.setStatus("connected");
      this.sendSyncStep1();
      this.sendFullAwareness();
    };

    ws.onmessage = (event) => {
      this.handleMessage(event.data as ArrayBuffer);
    };

    ws.onerror = () => {
      const err = new Error("WebSocket connection error.");
      this.onError?.(err);
      this.setStatus("error");
    };

    ws.onclose = () => {
      this.teardownListeners();
      this.ws = null;
      if (!this.intentionalClose) {
        this.setStatus("disconnected");
      }
    };
  }

  /** Gracefully disconnect and clean up local awareness. */
  disconnect(): void {
    this.intentionalClose = true;
    removeLocalAwareness(this.awareness);

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }

    this.teardownListeners();
    this.setStatus("disconnected");
  }

  /** Destroy the provider, awareness, and document. */
  destroy(): void {
    this.disconnect();
    this.awareness.destroy();
    this.doc.destroy();
    this.setStatus("idle");
  }

  /** Push updated local user metadata into awareness. */
  updateUser(user: AwarenessUser): void {
    setLocalUser(this.awareness, user);
  }

  // ── private ──────────────────────────────────────────────

  private setStatus(status: ProviderStatus): void {
    this.status = status;
    this.onStatus?.(status);
  }

  private send(type: CollaborationMessageType, payload?: Uint8Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const message = encodeCollaborationMessage(type, payload);
    this.ws.send(toSendBuffer(message));
  }

  private sendSyncStep1(): void {
    this.send(CollaborationMessage.Sync, encodeSyncStep1(this.doc));
  }

  private sendFullAwareness(): void {
    this.send(
      CollaborationMessage.Awareness,
      encodeFullAwarenessUpdate(this.awareness),
    );
  }

  private handleDocUpdate(update: Uint8Array, origin: unknown): void {
    if (origin === "remote" || origin === this.ws) return;
    this.send(CollaborationMessage.Sync, encodeSyncUpdate(update));
  }

  private handleAwarenessUpdate(
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown,
  ): void {
    if (origin === "remote") return;
    const changed = added.concat(updated, removed);
    if (changed.length === 0) return;
    this.send(
      CollaborationMessage.Awareness,
      encodeAwarenessUpdate(this.awareness, changed),
    );
  }

  private handleMessage(data: ArrayBuffer): void {
    try {
      const { type, payload } = decodeCollaborationMessage(data);

      switch (type) {
        case CollaborationMessage.Sync: {
          if (payload.length === 0) return;
          const response = applySyncMessage(this.doc, payload, "remote");
          if (response.length > 0) {
            this.send(CollaborationMessage.Sync, response);
          }
          break;
        }

        case CollaborationMessage.Awareness: {
          if (payload.length === 0) return;
          applyAwarenessUpdate(this.awareness, payload, "remote");
          break;
        }

        default:
          console.warn(
            `[YjsProvider] Unknown collaboration message type: ${type}`,
          );
      }
    } catch (err) {
      console.error("[YjsProvider] Failed to process message", err);
      this.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private teardownListeners(): void {
    this.doc.off("update", this.boundDocUpdate);
    this.awareness.off("update", this.boundAwarenessUpdate);
    this.peersUnsub?.();
    this.peersUnsub = null;
  }
}
