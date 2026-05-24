import { getDb } from "../../infra/db/index.js";
import { createHash, randomBytes } from "node:crypto";
import { config } from "../../../../../config/index.js";
import { NotFoundError, UnauthorizedError } from "../../../../../shared/errors.js";

export interface ApiKeyRecord {
  id: string; tenantId: string; name: string | null;
  lastUsedAt: Date | null; expiresAt: Date | null; createdAt: Date;
}

export interface CreateApiKeyResult { record: ApiKeyRecord; plainKey: string; }

export const ApiKeyRepository = {
  async create(tenantId: string, name?: string): Promise<CreateApiKeyResult> {
    const db = getDb();
    const plainKey = `eqa_${randomBytes(32).toString("hex")}`;
    const keyHash = hashApiKey(plainKey);
    const [record] = await db<ApiKeyRecord[]>`
      INSERT INTO api_keys (tenant_id, key_hash, name)
      VALUES (${tenantId}, ${keyHash}, ${name ?? null})
      RETURNING id, tenant_id AS "tenantId", name,
        last_used_at AS "lastUsedAt", expires_at AS "expiresAt", created_at AS "createdAt"
    `;
    return { record, plainKey };
  },

  async validate(plainKey: string): Promise<string> {
    const db = getDb();
    const keyHash = hashApiKey(plainKey);
    const [row] = await db<Array<{ tenantId: string; id: string }>>`
      SELECT tenant_id AS "tenantId", id FROM api_keys
      WHERE key_hash = ${keyHash} AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
    if (!row) throw new UnauthorizedError("API Key inválida ou revogada");
    db`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${row.id}`.catch(() => {});
    return row.tenantId;
  },

  async listByTenant(tenantId: string): Promise<ApiKeyRecord[]> {
    const db = getDb();
    return db<ApiKeyRecord[]>`
      SELECT id, tenant_id AS "tenantId", name,
        last_used_at AS "lastUsedAt", expires_at AS "expiresAt", created_at AS "createdAt"
      FROM api_keys WHERE tenant_id = ${tenantId} AND revoked_at IS NULL
      ORDER BY created_at DESC
    `;
  },

  async revoke(id: string, tenantId: string): Promise<void> {
    const db = getDb();
    const result = await db`
      UPDATE api_keys SET revoked_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId} AND revoked_at IS NULL
    `;
    if (result.count === 0) throw new NotFoundError("API Key");
  },
};

function hashApiKey(plainKey: string): string {
  return createHash("sha256").update(config.auth.apiKeySalt + plainKey).digest("hex");
}
