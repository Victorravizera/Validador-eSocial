"use strict";
/**
 * Hierarquia de erros de domínio.
 *
 * Regra: NUNCA retorne stack traces ou detalhes internos ao cliente.
 * O handler global do Fastify converte esses erros em respostas HTTP seguras.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BatchTooLargeError = exports.InvalidEventIdError = exports.ValidationError = exports.AppError = void 0;
exports.isOperationalError = isOperationalError;
class AppError extends Error {
    code;
    statusCode;
    isOperational;
    constructor(message, code, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true; // erros operacionais não crasham o processo
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, "VALIDATION_ERROR", 422);
    }
}
exports.ValidationError = ValidationError;
class InvalidEventIdError extends AppError {
    constructor(eventId) {
        super(`Evento não suportado: ${eventId}`, "INVALID_EVENT_ID", 400);
    }
}
exports.InvalidEventIdError = InvalidEventIdError;
class BatchTooLargeError extends AppError {
    constructor(max) {
        super(`Batch excede o limite de ${max} eventos por requisição`, "BATCH_TOO_LARGE", 400);
    }
}
exports.BatchTooLargeError = BatchTooLargeError;
class UnauthorizedError extends AppError {
    constructor(message = "Não autorizado") {
        super(message, "UNAUTHORIZED", 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Acesso negado") {
        super(message, "FORBIDDEN", 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} não encontrado`, "NOT_FOUND", 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Verifica se o erro é operacional (esperado) ou inesperado (bug).
 * Erros inesperados devem acionar alertas no Sentry/PagerDuty.
 */
function isOperationalError(err) {
    return err instanceof AppError && err.isOperational;
}
