"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const index_js_1 = require("../../../config/index.js");
const logger_js_1 = require("../../../shared/logger.js");
const errorHandler_js_1 = require("./http/middlewares/errorHandler.js");
const health_js_1 = require("./http/routes/health.js");
const auth_js_1 = require("./http/routes/auth.js");
const validate_js_1 = require("./http/routes/validate.js");
const batch_js_1 = require("./http/routes/batch.js");
const tenant_js_1 = require("./http/routes/tenant.js");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: false,
        requestIdHeader: "x-request-id",
        genReqId: () => crypto.randomUUID(),
        trustProxy: index_js_1.config.server.isProd,
    });
    await app.register(helmet_1.default, { contentSecurityPolicy: false });
    await app.register(cors_1.default, {
        origin: index_js_1.config.cors.origins,
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-API-Key", "X-Request-Id"],
    });
    await app.register(rate_limit_1.default, {
        max: index_js_1.config.rateLimit.max,
        timeWindow: index_js_1.config.rateLimit.windowMs,
        keyGenerator: (req) => req.tenant?.id ?? req.ip,
        errorResponseBuilder: (_req, ctx) => ({
            error: { code: "RATE_LIMITED", message: `Muitas requisições. Aguarde ${Math.ceil(ctx.ttl / 1000)}s.` },
        }),
    });
    await app.register(swagger_1.default, {
        openapi: {
            info: { title: "eSocial QA Validator API", description: "Validação de eventos trabalhistas", version: "1.0.0" },
            components: { securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "X-API-Key" } } },
        },
    });
    await app.register(swagger_ui_1.default, { routePrefix: "/docs", staticCSP: true });
    await app.register(health_js_1.healthRoute);
    await app.register(async (v1) => {
        await v1.register(auth_js_1.authRoutes);
        await v1.register(tenant_js_1.meRoute);
        await v1.register(tenant_js_1.historyRoute);
        await v1.register(validate_js_1.validateEventRoute);
        await v1.register(batch_js_1.validateBatchRoute);
    }, { prefix: "/v1" });
    app.setErrorHandler(errorHandler_js_1.errorHandler);
    app.addHook("onResponse", (request, reply, done) => {
        logger_js_1.logger.info({
            method: request.method, url: request.url, statusCode: reply.statusCode,
            durationMs: Math.round(reply.elapsedTime), requestId: request.id, tenantId: request.tenant?.id,
        }, "request:completed");
        done();
    });
    return app;
}
