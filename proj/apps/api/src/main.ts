import { buildApp } from "./app.js";
import { config } from "../../../config/index.js";
import { logger } from "../../../shared/logger.js";
import { closeDb } from "./infra/db/index.js";
import { closeRedis } from "./infra/redis/index.js";

async function main() {
  const app = await buildApp();
  try {
    await app.listen({ port: config.server.port, host: config.server.host });
    logger.info({ port: config.server.port }, "server:started");
  } catch (err) {
    logger.fatal({ err }, "server:failed_to_start");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "server:shutdown_started");
    try {
      await app.close();
      await closeDb();
      await closeRedis();
      logger.info("server:shutdown_complete");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "server:shutdown_error");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (err) => { logger.fatal({ err }, "process:uncaught_exception"); process.exit(1); });
  process.on("unhandledRejection", (reason) => { logger.fatal({ reason }, "process:unhandled_rejection"); process.exit(1); });
}

main();
