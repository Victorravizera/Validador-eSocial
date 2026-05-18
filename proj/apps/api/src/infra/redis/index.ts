import { Redis } from "ioredis";
import { config } from "../../../../config/index.js";
import { logger } from "../../../../shared/logger.js";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;

  _redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    showFriendlyErrorStack: config.server.isDev,
  });

  _redis.on("connect", () => logger.info("redis:connected"));
  _redis.on("error", (err) => logger.error({ err }, "redis:error"));
  _redis.on("close", () => logger.warn("redis:disconnected"));

  return _redis;
}

export async function closeRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
    logger.info("redis:closed");
  }
}
