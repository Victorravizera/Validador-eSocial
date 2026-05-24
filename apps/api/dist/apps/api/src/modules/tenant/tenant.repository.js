"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRepository = void 0;
const index_js_1 = require("../../infra/db/index.js");
const errors_js_1 = require("../../../../../shared/errors.js");
const QUOTA_BY_PLAN = {
    starter: 5_000, pro: 50_000, enterprise: 999_999_999,
};
exports.TenantRepository = {
    async create(input) {
        const db = (0, index_js_1.getDb)();
        const quota = QUOTA_BY_PLAN[input.plan];
        const [row] = await db `
      INSERT INTO tenants (name, plan, monthly_quota)
      VALUES (${input.name}, ${input.plan}, ${quota})
      RETURNING id, name, plan, monthly_quota AS "monthlyQuota"
    `;
        return { ...row, usedThisMonth: 0 };
    },
    async findById(id) {
        const db = (0, index_js_1.getDb)();
        const yearMonth = new Date().toISOString().slice(0, 7);
        const [row] = await db `
      SELECT t.id, t.name, t.plan,
        t.monthly_quota AS "monthlyQuota",
        COALESCE(q.used, 0) AS "usedThisMonth"
      FROM tenants t
      LEFT JOIN quota_usage q ON q.tenant_id = t.id AND q.year_month = ${yearMonth}
      WHERE t.id = ${id}
    `;
        if (!row)
            throw new errors_js_1.NotFoundError("Tenant");
        return row;
    },
    async incrementQuota(tenantId, amount = 1) {
        const db = (0, index_js_1.getDb)();
        const yearMonth = new Date().toISOString().slice(0, 7);
        await db `
      INSERT INTO quota_usage (tenant_id, year_month, used)
      VALUES (${tenantId}, ${yearMonth}, ${amount})
      ON CONFLICT (tenant_id, year_month)
      DO UPDATE SET used = quota_usage.used + ${amount}
    `;
    },
};
