import * as Y from "yjs";

import { logger } from "../../../../infrastructure/logging/logger";

export interface DecodedUpdate {
  type: number;
  update?: Uint8Array;
}

export class UpdateDecoder {
  // Decodes incoming Yjs binary messages.
  public decode(message: Buffer): DecodedUpdate {
    try {
      const messageType = message[0];

      logger.debug(
        {
          messageType,
          bytes: message.length,
        },
        "Decoding Yjs update message.",
      );

      return {
        type: messageType,
      };
    } catch (error) {
      logger.error(
        {
          err: error,
        },
        "Failed to decode Yjs update message.",
      );

      throw error;
    }
  }
}

export const updateDecoder = new UpdateDecoder();
