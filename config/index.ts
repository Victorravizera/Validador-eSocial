import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida (postgresql://...)"),
  DATABASE_POOL_MIN: z.coerce.number().int().min(1).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(2).default(10),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter no mínimo 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  API_KEY_SALT: z.string().min(16, "API_KEY_SALT deve ter no mínimo 16 caracteres"),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
  CORS_ORIGINS: z.string().default("*"),
  SENTRY_DSN: z.string().optional(),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n[config] Variáveis de ambiente inválidas ou ausentes:\n${issues}\n` +
        `  → Copie .env.example para .env e preencha os valores.\n`
    );
    process.exit(1);
  }
  return result.data;
}

const env = loadConfig();

export const config = {
  server: {
    port: env.PORT,
    host: env.HOST,
    env: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    isDev: env.NODE_ENV === "development",
    isProd: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },
  db: {
    url: env.DATABASE_URL,
    poolMin: env.DATABASE_POOL_MIN,
    poolMax: env.DATABASE_POOL_MAX,
  },
  redis: {
    url: env.REDIS_URL ?? "",
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    apiKeySalt: env.API_KEY_SALT,
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
  },
  cors: {
    origins: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
} as const;

export type Config = typeof config;