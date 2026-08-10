import * as encoding from "lib0/encoding";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import type { CollaborationMessageType } from "./protocol";

export class CollaborationMessageEncoder {
  /**
   * Encodes a collaboration protocol message into
   * a binary WebSocket payload.
   *
   * Message format:
   *
   * ┌────────────────────┬──────────────────────┐
   * │ Message Type       │ Payload              │
   * │ varUint            │ Uint8Array           │
   * └────────────────────┴──────────────────────┘
   */
  public encode(
    messageType: CollaborationMessageType,
    payload?: Uint8Array,
  ): Uint8Array {
    try {
      const encoder = encoding.createEncoder();

      // Encode the top-level collaboration message type.
      encoding.writeVarUint(encoder, messageType);

      // Append the protocol payload when present.
      if (payload && payload.length > 0) {
        encoding.writeUint8Array(encoder, payload);
      }

      const encoded = encoding.toUint8Array(encoder);

      yjsLogger.debug(
        {
          messageType,
          payloadBytes: payload?.length ?? 0,
          bytes: encoded.length,
        },
        "Encoded Yjs protocol message.",
      );

      return encoded;
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          messageType,
          payloadBytes: payload?.length ?? 0,
        },
        "Failed to encode Yjs protocol message.",
      );

      throw error;
    }
  }
}

export const collaborationMessageEncoder = new CollaborationMessageEncoder();
