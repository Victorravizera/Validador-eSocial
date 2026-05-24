"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("../../../config/index.js");
const logger_js_1 = require("../../../shared/logger.js");
const index_js_2 = require("./infra/db/index.js");
const index_js_3 = require("./infra/redis/index.js");
async function main() {
    const app = await (0, app_js_1.buildApp)();
    try {
        await app.listen({ port: index_js_1.config.server.port, host: index_js_1.config.server.host });
        logger_js_1.logger.info({ port: index_js_1.config.server.port }, "server:started");
    }
    catch (err) {
        logger_js_1.logger.fatal({ err }, "server:failed_to_start");
        process.exit(1);
    }
    const shutdown = async (signal) => {
        logger_js_1.logger.info({ signal }, "server:shutdown_started");
        try {
            await app.close();
            await (0, index_js_2.closeDb)();
            await (0, index_js_3.closeRedis)();
            process.exit(0);
        }
        catch (err) {
            logger_js_1.logger.error({ err }, "server:shutdown_error");
            process.exit(1);
        }
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("uncaughtException", (err) => { logger_js_1.logger.fatal({ err }, "uncaught"); process.exit(1); });
    process.on("unhandledRejection", (reason) => { logger_js_1.logger.fatal({ reason }, "unhandled"); process.exit(1); });
}
main();
