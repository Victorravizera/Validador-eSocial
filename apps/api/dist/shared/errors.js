/**
 * Hierarquia de erros de domínio.
 *
 * Regra: NUNCA retorne stack traces ou detalhes internos ao cliente.
 * O handler global do Fastify converte esses erros em respostas HTTP seguras.
 */
export class AppError extends Error {
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
export class ValidationError extends AppError {
    constructor(message) {
        super(message, "VALIDATION_ERROR", 422);
    }
}
export class InvalidEventIdError extends AppError {
    constructor(eventId) {
        super(`Evento não suportado: ${eventId}`, "INVALID_EVENT_ID", 400);
    }
}
export class BatchTooLargeError extends AppError {
    constructor(max) {
        super(`Batch excede o limite de ${max} eventos por requisição`, "BATCH_TOO_LARGE", 400);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Não autorizado") {
        super(message, "UNAUTHORIZED", 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "Acesso negado") {
        super(message, "FORBIDDEN", 403);
    }
}
export class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} não encontrado`, "NOT_FOUND", 404);
    }
}
/**
 * Verifica se o erro é operacional (esperado) ou inesperado (bug).
 * Erros inesperados devem acionar alertas no Sentry/PagerDuty.
 */
export function isOperationalError(err) {
    return err instanceof AppError && err.isOperational;
}
