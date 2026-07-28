import * as Y from "yjs";
import { createClient, type RedisClientType } from "redis";

import { ENV } from "../../../../config/env";
import { websocketConfig } from "../../../../config/websocket";
import { logger } from "../../../../infrastructure/logging/logger";

class RedisSync {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;

  private available = false;

  /**
   * Tracks subscribed Redis channels to prevent duplicate subscriptions.
   */
  private readonly subscribedRooms = new Set<string>();

  /**
   * Tracks documents that already have a publish listener attached.
   */
  private readonly boundDocuments = new WeakSet<Y.Doc>();

  /**
   * Initializes Redis Pub/Sub clients.
   * Falls back to local-only collaboration if Redis is unavailable.
   */
  public async connect(): Promise<void> {
    try {
      this.publisher = createClient({
        url: ENV.REDIS_URL,
      });

      this.subscriber = this.publisher.duplicate();

      this.publisher.on("error", (err) => {
        logger.warn({ err }, "Redis publisher client error.");
      });

      this.subscriber.on("error", (err) => {
        logger.warn({ err }, "Redis subscriber client error.");
      });

      await this.publisher.connect();
      await this.subscriber.connect();

      this.available = true;

      logger.info("Redis Pub/Sub initialized successfully.");
    } catch (error) {
      this.publisher = null;
      this.subscriber = null;
      this.available = false;

      logger.warn(
        { err: error },
        "Redis unavailable. Falling back to local-only collaboration.",
      );
    }
  }

  /**
   * Returns whether Redis synchronization is available.
   */
  public isAvailable(): boolean {
    return this.available;
  }

  /**
   * Enables Redis synchronization for a Yjs document.
   */
  public bind(documentName: string, document: Y.Doc): void {
    if (!this.available || !this.publisher || !this.subscriber) {
      return;
    }

    const channel = `${websocketConfig.redisChannelPrefix}${documentName}`;

    /**
     * Publish local document updates.
     */
    if (!this.boundDocuments.has(document)) {
      this.boundDocuments.add(document);

      document.on("update", (update, origin) => {
        if (origin === "redis") {
          return;
        }

        if (!this.publisher?.isOpen) {
          return;
        }

        void this.publisher
          .publish(channel, Buffer.from(update).toString("base64"))
          .catch((error) => {
            logger.error(
              {
                err: error,
                documentName,
              },
              "Failed to publish Redis update.",
            );
          });
      });
    }

    /**
     * Subscribe once per room.
     */
    if (this.subscribedRooms.has(documentName)) {
      return;
    }

    this.subscribedRooms.add(documentName);

    void this.subscriber
      .subscribe(channel, (message) => {
        try {
          const update = Buffer.from(message, "base64");

          Y.applyUpdate(document, update, "redis");
        } catch (error) {
          logger.error(
            {
              err: error,
              documentName,
            },
            "Failed to apply Redis update.",
          );
        }
      })
      .catch((error) => {
        this.subscribedRooms.delete(documentName);

        logger.error(
          {
            err: error,
            documentName,
          },
          "Failed to subscribe to Redis channel.",
        );
      });
  }

  /**
   * Removes a Redis subscription for a document.
   */
  public async cleanup(documentName: string): Promise<void> {
    if (!this.available || !this.subscriber?.isOpen) {
      return;
    }

    if (!this.subscribedRooms.has(documentName)) {
      return;
    }

    const channel = `${websocketConfig.redisChannelPrefix}${documentName}`;

    try {
      await this.subscriber.unsubscribe(channel);

      this.subscribedRooms.delete(documentName);

      logger.debug({ documentName }, "Redis room unsubscribed.");
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName,
        },
        "Failed to unsubscribe Redis room.",
      );
    }
  }

  /**
   * Gracefully closes Redis connections.
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.publisher?.isOpen) {
        await this.publisher.quit();
      }

      if (this.subscriber?.isOpen) {
        await this.subscriber.quit();
      }

      this.publisher = null;
      this.subscriber = null;
      this.available = false;
      this.subscribedRooms.clear();

      logger.info("Redis synchronization stopped.");
    } catch (error) {
      logger.error({ err: error }, "Failed to disconnect Redis clients.");
    }
  }
}

const redisSync = new RedisSync();

export const setupRedis = (): Promise<void> => redisSync.connect();

export const bindRedisSync = (documentName: string, document: Y.Doc): void =>
  redisSync.bind(documentName, document);

export const cleanupRedisRoom = (documentName: string): Promise<void> =>
  redisSync.cleanup(documentName);

export const shutdownRedis = (): Promise<void> => redisSync.disconnect();

export const isRedisAvailable = (): boolean => redisSync.isAvailable();
