"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
var zod_1 = require("zod");
var errors_js_1 = require("../../../../../shared/errors.js");
var logger_js_1 = require("../../../../../shared/logger.js");
function errorHandler(err, request, reply) {
    var _a, _b;
    var requestId = (_a = request.id) !== null && _a !== void 0 ? _a : "unknown";
    if (err instanceof zod_1.ZodError) {
        var details = err.issues.map(function (i) { return ({ field: i.path.join("."), message: i.message }); });
        reply.status(422).send({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details: details }, requestId: requestId });
        return;
    }
    if ((0, errors_js_1.isOperationalError)(err)) {
        logger_js_1.logger.warn({ code: err.code, requestId: requestId }, err.message);
        reply.status(err.statusCode).send({ error: { code: err.code, message: err.message }, requestId: requestId });
        return;
    }
    if (err instanceof Error && "statusCode" in err) {
        var status_1 = (_b = err.statusCode) !== null && _b !== void 0 ? _b : 500;
        reply.status(status_1).send({ error: { code: "REQUEST_ERROR", message: err.message }, requestId: requestId });
        return;
    }
    logger_js_1.logger.error({ err: err, requestId: requestId }, "Unhandled error");
    reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "Erro interno. Nossa equipe foi notificada." }, requestId: requestId });
}
