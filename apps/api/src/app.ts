import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { config } from "../../../config/index.js";
import { logger } from "../../../shared/logger.js";
import { errorHandler } from "./http/middlewares/errorHandler.js";
import { healthRoute } from "./http/routes/health.js";
import { authRoutes } from "./http/routes/auth.js";
import { validateEventRoute } from "./http/routes/validate.js";
import { validateBatchRoute } from "./http/routes/batch.js";
import { meRoute, historyRoute } from "./http/routes/tenant.js";

export async function buildApp() {
  const app = Fastify({
    logger: false,
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
    trustProxy: config.server.isProd,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.cors.origins,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-API-Key", "X-Request-Id"],
  });
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
    keyGenerator: (req) => req.tenant?.id ?? req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      error: { code: "RATE_LIMITED", message: `Muitas requisições. Aguarde ${Math.ceil(ctx.ttl / 1000)}s.` },
    }),
  });
  await app.register(swagger, {
    openapi: {
      info: { title: "eSocial QA Validator API", description: "Validação de eventos trabalhistas", version: "1.0.0" },
      components: { securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "X-API-Key" } } },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs", staticCSP: true });
  await app.register(healthRoute);
  await app.register(async (v1) => {
    await v1.register(authRoutes);
    await v1.register(meRoute);
    await v1.register(historyRoute);
    await v1.register(validateEventRoute);
    await v1.register(validateBatchRoute);
  }, { prefix: "/v1" });

  app.setErrorHandler(errorHandler);
  app.addHook("onResponse", (request, reply, done) => {
    logger.info({
      method: request.method, url: request.url, statusCode: reply.statusCode,
      durationMs: Math.round(reply.elapsedTime), requestId: request.id, tenantId: request.tenant?.id,
    }, "request:completed");
    done();
  });

  return app;
}
