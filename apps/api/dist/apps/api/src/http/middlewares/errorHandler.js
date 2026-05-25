"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_js_1 = require("../../../../../shared/errors.js");
const logger_js_1 = require("../../../../../shared/logger.js");
function errorHandler(err, request, reply) {
    const requestId = request.id ?? "unknown";
    if (err instanceof zod_1.ZodError) {
        const details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
        reply.status(422).send({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details }, requestId });
        return;
    }
    if ((0, errors_js_1.isOperationalError)(err)) {
        logger_js_1.logger.warn({ code: err.code, requestId }, err.message);
        reply.status(err.statusCode).send({ error: { code: err.code, message: err.message }, requestId });
        return;
    }
    if (err instanceof Error && "statusCode" in err) {
        const status = err.statusCode ?? 500;
        reply.status(status).send({ error: { code: "REQUEST_ERROR", message: err.message }, requestId });
        return;
    }
    // Log detalhado do erro inesperado
    const errorDetails = err instanceof Error ? {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause,
    } : { raw: JSON.stringify(err) };
    logger_js_1.logger.error({ error: errorDetails, requestId }, "Unhandled error");
    reply.status(500).send({
        error: {
            code: "INTERNAL_ERROR",
            message: err instanceof Error ? err.message : "Erro interno",
        },
        requestId,
    });
}
