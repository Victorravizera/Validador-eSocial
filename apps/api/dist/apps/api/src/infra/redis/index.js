"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = getRedis;
exports.closeRedis = closeRedis;
const ioredis_1 = require("ioredis");
const index_js_1 = require("../../../../../config/index.js");
const logger_js_1 = require("../../../../../shared/logger.js");
let _redis = null;
function getRedis() {
    if (!index_js_1.config.redis.url)
        return null;
    if (_redis)
        return _redis;
    try {
        _redis = new ioredis_1.Redis(index_js_1.config.redis.url, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
            showFriendlyErrorStack: index_js_1.config.server.isDev,
        });
        _redis.on("connect", () => logger_js_1.logger.info("redis:connected"));
        _redis.on("error", (err) => logger_js_1.logger.error({ err }, "redis:error"));
        _redis.on("close", () => logger_js_1.logger.warn("redis:disconnected"));
        return _redis;
    }
    catch {
        logger_js_1.logger.warn("redis:disabled — REDIS_URL não configurada");
        return null;
    }
}
async function closeRedis() {
    if (_redis) {
        await _redis.quit();
        _redis = null;
        logger_js_1.logger.info("redis:closed");
    }
}
