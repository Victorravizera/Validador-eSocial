import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: "debug",
  redact: {
    paths: [
      "password", "senha", "token", "accessToken", "refreshToken",
      "apiKey", "authorization", "cookie",
      "*.password", "*.senha", "*.token", "*.cpf", "*.cpfTrab", "*.nmTrab",
      "req.headers.authorization", "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  base: {
    service: "esocial-qa-api",
    env: config.server.env,
  },
  serializers: {
    err: (err: Error) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
    }),
  },
});

export type Logger = typeof logger;