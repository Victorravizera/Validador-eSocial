import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.server.logLevel,
  redact: {
    paths: [
      "password", "senha", "token", "accessToken", "refreshToken",
      "apiKey", "authorization", "cookie",
      "*.password", "*.senha", "*.token", "*.cpf", "*.cpfTrab", "*.nmTrab",
      "req.headers.authorization", "req.headers.cookie",
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
  serializers: {
    err: (err: Error) => ({
      type: err.constructor.name,
      message: err.message,
      stack: config.server.isDev ? err.stack : undefined,
    }),
  },
});

export type Logger = typeof logger;