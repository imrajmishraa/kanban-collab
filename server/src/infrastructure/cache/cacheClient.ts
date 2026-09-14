import { createClient, type RedisClientType } from "redis";

import { ENV } from "../../config/env";
import { redisLogger as log } from "../logging/childLogger";


// PUBLIC INTERFACE

/**
 * Minimal surface used by application code. Kept narrow so the Noop fallback
 * stays trivial and the mock in tests is small.
 */
export interface CacheClient {
  readonly isReady: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string | null>;
  setEx(key: string, ttlSeconds: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  incr(key: string): Promise<number>;
  quit(): Promise<void>;
}


// NOOP — used when Redis is unavailable or unconfigured

class NoopCacheClient implements CacheClient {
  readonly isReady = false;

  async get(_key: string): Promise<string | null> {
    return null;
  }

  async set(_key: string, _value: string): Promise<string | null> {
    return "OK";
  }

  async setEx(
    _key: string,
    _ttlSeconds: number,
    _value: string,
  ): Promise<string> {
    return "OK";
  }

  async del(..._keys: string[]): Promise<number> {
    return 0;
  }

  async exists(_key: string): Promise<number> {
    return 0;
  }

  async expire(_key: string, _ttlSeconds: number): Promise<boolean> {
    return false;
  }

  async incr(_key: string): Promise<number> {
    return 0;
  }

  async quit(): Promise<void> {
    /* no-op */
  }
}


// HELPERS

/**
 * Run a Redis command with graceful failure.
 * If the socket is dead or the command throws, returns `null` — callers treat
 * this as a cache miss, not an error.
 */
async function safeCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    log.debug({ err }, "Redis command failed — returning empty result.");
    return null as unknown as T;
  }
}

/**
 * Reconnect strategy for node-redis.
 *   retries 0  → immediate
 *   retries 1  → 200ms
 *   ...
 *   retries 5+ → 1000ms (cap)
 *   retries 10 → give up and stop retrying
 */
function buildReconnectStrategy() {
  return (retries: number): number | false => {
    if (retries > 10) {
      log.warn("Redis reconnect giving up after 10 retries.");
      return false;
    }
    return Math.min(retries * 200, 1000);
  };
}

/**
 * Wrap the raw node-redis client so:
 *   - Every command routes through `safeCall` (no thrown errors to callers)
 *   - `quit()` handles both live and dead sockets
 *   - The public surface matches `CacheClient` (not the full RedisClientType)
 */
function wrapRealClient(client: RedisClientType): CacheClient {
  return {
    get isReady() {
      return client.isReady;
    },

    async get(key) {
      return safeCall(() => client.get(key));
    },

    async set(key, value) {
      return safeCall(() => client.set(key, value));
    },

    async setEx(key, ttlSeconds, value) {
      return safeCall(() => client.setEx(key, ttlSeconds, value));
    },

    async del(...keys) {
      return safeCall(() => client.del(keys));
    },

    async exists(key) {
      return safeCall(() => client.exists(key));
    },

    async expire(key, ttlSeconds) {
      return safeCall(() => client.expire(key, ttlSeconds));
    },

    async incr(key) {
      return safeCall(() => client.incr(key));
    },

    async quit() {
      try {
        if (client.isOpen) {
          await client.quit();
        } else {
          await client.disconnect();
        }
      } catch (err) {
        log.warn({ err }, "Redis quit failed — forcing disconnect.");
        await client.disconnect().catch(() => {});
      }
    },
  };
}


// SINGLETON

let cachePromise: Promise<CacheClient> | null = null;

/**
 * Returns a Redis-backed cache client, or a Noop fallback when:
 *   - `REDIS_URL` is not set
 *   - The initial connection times out
 *   - The reconnect strategy has exhausted its retries
 *
 * Lazy — the client isn't built until the first call. Safe to import from
 * anywhere; the promise is memoized so only one connection is opened.
 */
export function getCacheClient(): Promise<CacheClient> {
  if (cachePromise) return cachePromise;

  cachePromise = (async (): Promise<CacheClient> => {
    const url = ENV.REDIS_URL;

    if (!url) {
      log.info("REDIS_URL not set — running without caching.");
      return new NoopCacheClient();
    }

    const raw = createClient({
      url,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: buildReconnectStrategy(),
      },
      disableOfflineQueue: true,
    }) as RedisClientType;

    // ── Lifecycle logging (throttled errors) ───────────────────────────────
    let lastErrorAt = 0;

    raw.on("error", (err: Error) => {
      const now = Date.now();
      if (now - lastErrorAt > 10_000) {
        log.warn({ err: err.message }, "Redis client error.");
        lastErrorAt = now;
      }
    });

    raw.on("ready", () => log.info("Redis cache client ready."));
    raw.on("reconnecting", () => log.warn("Redis cache client reconnecting…"));
    raw.on("end", () => log.warn("Redis cache client ended."));

    try {
      await raw.connect();
      log.info("Redis cache client connected.");
      return wrapRealClient(raw);
    } catch (err) {
      log.warn(
        { err: err instanceof Error ? err.message : err },
        "Redis connection failed — caching disabled.",
      );
      await raw.disconnect().catch(() => {});
      return new NoopCacheClient();
    }
  })();

  return cachePromise;
}

/**
 * Health check — returns true if the cache is live.
 * Useful for `/health` and `/ready` endpoints.
 */
export async function isCacheHealthy(): Promise<boolean> {
  const cache = await getCacheClient();
  return cache.isReady;
}

/**
 * Graceful shutdown — call from SIGTERM/SIGINT handler in `main.ts`.
 */
export async function closeCacheClient(): Promise<void> {
  if (!cachePromise) return;
  const cache = await cachePromise;
  await cache.quit();
  cachePromise = null;
}
