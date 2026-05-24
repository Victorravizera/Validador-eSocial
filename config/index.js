"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
var zod_1 = require("zod");
/**
 * Valida todas as variáveis de ambiente na inicialização.
 * Se algo estiver faltando ou inválido, o processo falha com mensagem clara.
 * NUNCA logue o objeto config completo — ele contém secrets.
 */
var envSchema = zod_1.z.object({
    // Server
    PORT: zod_1.z.coerce.number().int().min(1024).max(65535).default(3000),
    HOST: zod_1.z.string().default("0.0.0.0"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: zod_1.z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
    // Database
    DATABASE_URL: zod_1.z.string().url("DATABASE_URL deve ser uma URL válida (postgresql://...)"),
    DATABASE_POOL_MIN: zod_1.z.coerce.number().int().min(1).default(2),
    DATABASE_POOL_MAX: zod_1.z.coerce.number().int().min(2).default(10),
    // Redis
    REDIS_URL: zod_1.z.string().url("REDIS_URL deve ser uma URL válida (redis://...)"),
    // Auth
    JWT_SECRET: zod_1.z
        .string()
        .min(32, "JWT_SECRET deve ter no mínimo 32 caracteres"),
    JWT_EXPIRES_IN: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default("7d"),
    API_KEY_SALT: zod_1.z
        .string()
        .min(16, "API_KEY_SALT deve ter no mínimo 16 caracteres"),
    // Rate limiting
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().min(1).default(100),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().min(1000).default(60000),
    // CORS
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:3001"),
    // Observabilidade
    SENTRY_DSN: zod_1.z.string().optional(),
});
function loadConfig() {
    var result = envSchema.safeParse(process.env);
    if (!result.success) {
        var issues = result.error.issues
            .map(function (i) { return "  \u2022 ".concat(i.path.join("."), ": ").concat(i.message); })
            .join("\n");
        // Erro fatal — nenhum dado sensível é logado aqui, só os nomes das vars
        console.error("\n[config] Vari\u00E1veis de ambiente inv\u00E1lidas ou ausentes:\n".concat(issues, "\n") +
            "  \u2192 Copie .env.example para .env e preencha os valores.\n");
        process.exit(1);
    }
    return result.data;
}
var env = loadConfig();
exports.config = {
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
        url: env.REDIS_URL,
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
        origins: env.CORS_ORIGINS.split(",").map(function (o) { return o.trim(); }),
    },
    sentry: {
        dsn: env.SENTRY_DSN,
    },
};
