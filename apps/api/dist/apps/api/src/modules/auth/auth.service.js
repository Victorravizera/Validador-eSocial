"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const node_crypto_1 = require("node:crypto");
const index_js_1 = require("../../infra/db/index.js");
const tenant_repository_js_1 = require("../tenant/tenant.repository.js");
const apikey_repository_js_1 = require("./apikey.repository.js");
const index_js_2 = require("../../../../../config/index.js");
const errors_js_1 = require("../../../../../shared/errors.js");
const logger_js_1 = require("../../../../../shared/logger.js");
exports.AuthService = {
    async register(input) {
        const db = (0, index_js_1.getDb)();
        const [existing] = await db `
      SELECT id FROM tenant_users WHERE email = ${input.email} LIMIT 1
    `;
        if (existing)
            throw new errors_js_1.AppError("E-mail já cadastrado", "VALIDATION_ERROR", 409);
        const tenant = await tenant_repository_js_1.TenantRepository.create({ name: input.tenantName, plan: input.plan ?? "starter" });
        const { hash, salt } = hashPassword(input.password);
        await db `
      INSERT INTO tenant_users (tenant_id, email, password_hash, password_salt)
      VALUES (${tenant.id}, ${input.email}, ${hash}, ${salt})
    `;
        const { plainKey } = await apikey_repository_js_1.ApiKeyRepository.create(tenant.id, "Default Key");
        logger_js_1.logger.info({ tenantId: tenant.id, plan: tenant.plan }, "auth:registered");
        return { tenantId: tenant.id, apiKey: plainKey };
    },
    async login(input) {
        const db = (0, index_js_1.getDb)();
        const [user] = await db `
      SELECT tenant_id AS "tenantId", password_hash AS "passwordHash", password_salt AS "passwordSalt"
      FROM tenant_users WHERE email = ${input.email} LIMIT 1
    `;
        const dummySalt = (0, node_crypto_1.randomBytes)(16).toString("hex");
        const candidateHash = deriveKey(input.password, user?.passwordSalt ?? dummySalt);
        const storedHash = user?.passwordHash ?? (0, node_crypto_1.randomBytes)(32).toString("hex");
        const valid = user !== undefined &&
            (0, node_crypto_1.timingSafeEqual)(Buffer.from(candidateHash, "hex"), Buffer.from(storedHash, "hex"));
        if (!valid)
            throw new errors_js_1.UnauthorizedError("Credenciais inválidas");
        const { token, expiresIn } = issueJwt(user.tenantId);
        logger_js_1.logger.info({ tenantId: user.tenantId }, "auth:login");
        return { tenantId: user.tenantId, accessToken: token, expiresIn };
    },
};
function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    return { hash: deriveKey(password, salt), salt };
}
function deriveKey(password, salt) {
    return (0, node_crypto_1.pbkdf2Sync)(password, salt, 100_000, 32, "sha256").toString("hex");
}
const JWT_EXPIRES_SECONDS = 15 * 60;
function issueJwt(tenantId) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ sub: tenantId, iat: now, exp: now + JWT_EXPIRES_SECONDS })).toString("base64url");
    const sig = (0, node_crypto_1.createHmac)("sha256", index_js_2.config.auth.jwtSecret).update(`${header}.${payload}`).digest("base64url");
    return { token: `${header}.${payload}.${sig}`, expiresIn: JWT_EXPIRES_SECONDS };
}
