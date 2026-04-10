import pino from "pino";
import { config } from "@/config/index.js";

/**
 * Logger estruturado com Pino.
 *
 * Regras de segurança:
 * - NUNCA passe objetos de request completos (podem conter tokens/cpf/senha)
 * - Use os campos explícitos: { tenantId, eventId, durationMs }
 * - Campos sensíveis são redacted automaticamente pelo serializer abaixo
 */
export const logger = pino({
  level: config.server.logLevel,

  // Redact automático de campos sensíveis em qualquer objeto logado
  redact: {
    paths: [
      "password",
      "senha",
      "token",
      "accessToken",
      "refreshToken",
      "apiKey",
      "authorization",
      "cookie",
      "*.password",
      "*.senha",
      "*.token",
      "*.cpf",        // dados pessoais — não logar em prod
      "*.cpfTrab",
      "*.nmTrab",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },

  transport: config.server.isDev
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
    : undefined,

  base: {
    service: "esocial-qa-api",
    env: config.server.env,
  },

  // Serializer de erro seguro — não vaza stack em produção
  serializers: {
    err: (err: Error) => ({
      type: err.constructor.name,
      message: err.message,
      stack: config.server.isDev ? err.stack : undefined,
    }),
  },
});

export type Logger = typeof logger;
