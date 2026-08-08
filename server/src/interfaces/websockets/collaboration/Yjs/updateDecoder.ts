import * as decoding from "lib0/decoding";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";
import { InvalidCollaborationMessageError } from "../../../../shared/errors/websocket/websocket";

import type { DecodedMessage } from "./types";
import { ERROR_MESSAGE } from "../../../../shared/constants/error";

export class UpdateDecoder {
  public decode(message: Buffer | Uint8Array): DecodedMessage {
    try {
      if (message.length === 0) {
        throw new InvalidCollaborationMessageError(
           ERROR_MESSAGE.WEBSOCKET_EMPTY_COLLABORATION_MESSAGE,
        );
      }

      const decoder = decoding.createDecoder(message);

      const type = decoding.readVarUint(decoder);

      const update = this.readRemainingPayload(decoder);

      return {
        type,
        ...(update.length > 0 ? { update } : {}),
      };
    } catch (error) {
      yjsLogger.warn(
        {
          bytes: message.length,
          err: error,
        },
        "Failed to decode Yjs collaboration message.",
      );

      if (error instanceof InvalidCollaborationMessageError) {
        throw error;
      }

      throw new InvalidCollaborationMessageError(
         ERROR_MESSAGE.WEBSOCKET_EMPTY_COLLABORATION_MESSAGE,
      );
    }
  }

  private readRemainingPayload(decoder: decoding.Decoder): Uint8Array {
    const remaining = decoder.arr.length - decoder.pos;

    if (remaining <= 0) {
      return new Uint8Array(0);
    }

    const payload = decoder.arr.slice(decoder.pos, decoder.arr.length);

    decoder.pos = decoder.arr.length;

    return payload;
  }
}

export const updateDecoder = new UpdateDecoder();
