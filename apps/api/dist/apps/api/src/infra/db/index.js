"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.closeDb = closeDb;
const postgres_1 = __importDefault(require("postgres"));
const index_js_1 = require("../../../../../config/index.js");
const logger_js_1 = require("../../../../../shared/logger.js");
let _db = null;
function getDb() {
    if (_db)
        return _db;
    _db = (0, postgres_1.default)(index_js_1.config.db.url, {
        idle_timeout: 30,
        connect_timeout: 10,
        ssl: index_js_1.config.server.isProd ? { rejectUnauthorized: true } : false,
        onnotice: () => { },
        debug: index_js_1.config.server.isDev
            ? (_conn, query) => { logger_js_1.logger.debug({ query: query.slice(0, 200) }, "db:query"); }
            : false,
    });
    logger_js_1.logger.info({ poolMin: index_js_1.config.db.poolMin, poolMax: index_js_1.config.db.poolMax }, "db:connected");
    return _db;
}
async function closeDb() {
    if (_db) {
        await _db.end();
        _db = null;
        logger_js_1.logger.info("db:closed");
    }
}
