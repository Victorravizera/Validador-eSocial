import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { AppError, isOperationalError } from "../../../../shared/errors.js";
import { logger } from "../../../../shared/logger.js";

export function errorHandler(
  err: FastifyError | Error | unknown,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = (request.id as string) ?? "unknown";

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    reply.status(422).send({ error: { code: "VALIDATION_ERROR", message: "Dados de entrada inválidos", details }, requestId });
    return;
  }

  if (isOperationalError(err)) {
    logger.warn({ code: err.code, requestId }, err.message);
    reply.status(err.statusCode).send({ error: { code: err.code, message: err.message }, requestId });
    return;
  }

  if (err instanceof Error && "statusCode" in err) {
    const status = (err as FastifyError).statusCode ?? 500;
    reply.status(status).send({ error: { code: "REQUEST_ERROR", message: err.message }, requestId });
    return;
  }

  logger.error({ err, requestId }, "Unhandled error");
  reply.status(500).send({
    error: { code: "INTERNAL_ERROR", message: "Erro interno. Nossa equipe foi notificada." },
    requestId,
  });
}
