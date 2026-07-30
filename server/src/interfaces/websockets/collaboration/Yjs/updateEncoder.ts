import { logger } from "../../../../infrastructure/logging/logger";

import type { CollaborationMessageType } from "./protocol";

export class UpdateEncoder {
  /**
   * Encodes Yjs protocol messages
   * into binary WebSocket payloads.
   */
  public encode(
    messageType: CollaborationMessageType,
    payload?: Uint8Array,
  ): Uint8Array {
    try {
      const payloadLength = payload?.length ?? 0;

      const buffer = new Uint8Array(1 + payloadLength);

      // First byte contains protocol message type.
      buffer[0] = messageType;

      if (payload) {
        buffer.set(payload, 1);
      }

      logger.debug(
        {
          messageType,
          bytes: buffer.length,
        },
        "Encoded Yjs protocol message.",
      );

      return buffer;
    } catch (error) {
      logger.error(
        {
          err: error,
        },
        "Failed to encode Yjs protocol message.",
      );

      throw error;
    }
  }
}

export const updateEncoder = new UpdateEncoder();
