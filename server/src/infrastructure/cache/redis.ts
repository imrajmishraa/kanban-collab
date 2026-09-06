import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL;
const CONNECT_TIMEOUT_MS = 2000;
const MAX_RETRIES = 3;

type CacheClient = Pick<RedisClientType, "get" | "setEx" | "quit"> & {
  isReady: boolean;
};

class NoopCacheClient implements CacheClient {
  readonly isReady = false;

  async get(): Promise<Awaited<ReturnType<CacheClient["get"]>>> {
    return null;
  }

  async setEx(
    ...args: Parameters<CacheClient["setEx"]>
  ): Promise<Awaited<ReturnType<CacheClient["setEx"]>>> {
    return "OK" as Awaited<ReturnType<CacheClient["setEx"]>>;
  }

  async quit(): Promise<Awaited<ReturnType<CacheClient["quit"]>>> {
    return "OK" as Awaited<ReturnType<CacheClient["quit"]>>;
  }
}

function buildRedisClient(url: string): RedisClientType {
  const client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > MAX_RETRIES) {
          console.warn(
            `⚠️ Redis: giving up after ${MAX_RETRIES} retries — caching disabled for this session`,
          );
          return false;
        }
        return Math.min(retries * 100, 1000);
      },
      connectTimeout: CONNECT_TIMEOUT_MS,
    },
    disableOfflineQueue: true,
  }) as RedisClientType;

  let lastLoggedAt = 0;
  client.on("error", (err: Error) => {
    const now = Date.now();
    if (now - lastLoggedAt > 10_000) {
      console.warn("⚠️ Redis client error:", err.message);
      lastLoggedAt = now;
    }
  });

  return client;
}

let cachePromise: Promise<CacheClient> | null = null;

export function getCacheClient(): Promise<CacheClient> {
  if (!cachePromise) {
    cachePromise = (async () => {
      if (!REDIS_URL) {
        console.info("ℹ️ REDIS_URL not set — running without caching");
        return new NoopCacheClient();
      }

      try {
        const client = buildRedisClient(REDIS_URL);
        await client.connect();
        return client;
      } catch (err) {
        console.warn(
          "⚠️ Redis connection failed — caching disabled:",
          err instanceof Error ? err.message : err,
        );
        return new NoopCacheClient();
      }
    })();
  }
  return cachePromise;
}
