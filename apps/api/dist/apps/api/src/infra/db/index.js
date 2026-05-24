import postgres from "postgres";
import { config } from "../../../../../config/index.js";
import { logger } from "../../../../../shared/logger.js";
let _db = null;
export function getDb() {
    if (_db)
        return _db;
    _db = postgres(config.db.url, {
        idle_timeout: 30,
        connect_timeout: 10,
        ssl: config.server.isProd ? { rejectUnauthorized: true } : false,
        onnotice: () => { },
        debug: config.server.isDev
            ? (_conn, query) => { logger.debug({ query: query.slice(0, 200) }, "db:query"); }
            : false,
    });
    logger.info({ poolMin: config.db.poolMin, poolMax: config.db.poolMax }, "db:connected");
    return _db;
}
export async function closeDb() {
    if (_db) {
        await _db.end();
        _db = null;
        logger.info("db:closed");
    }
}
