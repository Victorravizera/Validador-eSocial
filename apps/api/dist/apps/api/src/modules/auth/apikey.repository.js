"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyRepository = void 0;
const index_js_1 = require("../../infra/db/index.js");
const node_crypto_1 = require("node:crypto");
const index_js_2 = require("../../../../../config/index.js");
const errors_js_1 = require("../../../../../shared/errors.js");
exports.ApiKeyRepository = {
    async create(tenantId, name) {
        const db = (0, index_js_1.getDb)();
        const plainKey = `eqa_${(0, node_crypto_1.randomBytes)(32).toString("hex")}`;
        const keyHash = hashApiKey(plainKey);
        const [record] = await db `
      INSERT INTO api_keys (tenant_id, key_hash, name)
      VALUES (${tenantId}, ${keyHash}, ${name ?? null})
      RETURNING id, tenant_id AS "tenantId", name,
        last_used_at AS "lastUsedAt", expires_at AS "expiresAt", created_at AS "createdAt"
    `;
        return { record, plainKey };
    },
    async validate(plainKey) {
        const db = (0, index_js_1.getDb)();
        const keyHash = hashApiKey(plainKey);
        const [row] = await db `
      SELECT tenant_id AS "tenantId", id FROM api_keys
      WHERE key_hash = ${keyHash} AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
        if (!row)
            throw new errors_js_1.UnauthorizedError("API Key inválida ou revogada");
        db `UPDATE api_keys SET last_used_at = NOW() WHERE id = ${row.id}`.catch(() => { });
        return row.tenantId;
    },
    async listByTenant(tenantId) {
        const db = (0, index_js_1.getDb)();
        return db `
      SELECT id, tenant_id AS "tenantId", name,
        last_used_at AS "lastUsedAt", expires_at AS "expiresAt", created_at AS "createdAt"
      FROM api_keys WHERE tenant_id = ${tenantId} AND revoked_at IS NULL
      ORDER BY created_at DESC
    `;
    },
    async revoke(id, tenantId) {
        const db = (0, index_js_1.getDb)();
        const result = await db `
      UPDATE api_keys SET revoked_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId} AND revoked_at IS NULL
    `;
        if (result.count === 0)
            throw new errors_js_1.NotFoundError("API Key");
    },
};
function hashApiKey(plainKey) {
    return (0, node_crypto_1.createHash)("sha256").update(index_js_2.config.auth.apiKeySalt + plainKey).digest("hex");
}
