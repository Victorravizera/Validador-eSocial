/**
 * Hierarquia de erros de domínio.
 *
 * Regra: NUNCA retorne stack traces ou detalhes internos ao cliente.
 * O handler global do Fastify converte esses erros em respostas HTTP seguras.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_EVENT_ID"
  | "BATCH_TOO_LARGE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true; // erros operacionais não crasham o processo
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class InvalidEventIdError extends AppError {
  constructor(eventId: string) {
    super(`Evento não suportado: ${eventId}`, "INVALID_EVENT_ID", 400);
  }
}

export class BatchTooLargeError extends AppError {
  constructor(max: number) {
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
  constructor(resource: string) {
    super(`${resource} não encontrado`, "NOT_FOUND", 404);
  }
}

/**
 * Verifica se o erro é operacional (esperado) ou inesperado (bug).
 * Erros inesperados devem acionar alertas no Sentry/PagerDuty.
 */
export function isOperationalError(err: unknown): err is AppError {
  return err instanceof AppError && err.isOperational;
}
