import { getDb } from "../../infra/db/index.js";
import type { Tenant, Plan } from "../../../../shared/types.js";
import { NotFoundError } from "../../../../shared/errors.js";

export interface CreateTenantInput {
  name: string;
  plan: Plan;
}

const QUOTA_BY_PLAN: Record<Plan, number> = {
  starter: 5_000,
  pro: 50_000,
  enterprise: 999_999_999,
};

export const TenantRepository = {
  async create(input: CreateTenantInput): Promise<Tenant> {
    const db = getDb();
    const quota = QUOTA_BY_PLAN[input.plan];
    const [row] = await db<Tenant[]>`
      INSERT INTO tenants (name, plan, monthly_quota)
      VALUES (${input.name}, ${input.plan}, ${quota})
      RETURNING id, name, plan, monthly_quota AS "monthlyQuota"
    `;
    return { ...row, usedThisMonth: 0 };
  },

  async findById(id: string): Promise<Tenant> {
    const db = getDb();
    const yearMonth = new Date().toISOString().slice(0, 7);
    const [row] = await db<Array<Tenant & { usedThisMonth: number }>>`
      SELECT
        t.id, t.name, t.plan,
        t.monthly_quota AS "monthlyQuota",
        COALESCE(q.used, 0) AS "usedThisMonth"
      FROM tenants t
      LEFT JOIN quota_usage q ON q.tenant_id = t.id AND q.year_month = ${yearMonth}
      WHERE t.id = ${id}
    `;
    if (!row) throw new NotFoundError("Tenant");
    return row;
  },

  async incrementQuota(tenantId: string, amount = 1): Promise<void> {
    const db = getDb();
    const yearMonth = new Date().toISOString().slice(0, 7);
    await db`
      INSERT INTO quota_usage (tenant_id, year_month, used)
      VALUES (${tenantId}, ${yearMonth}, ${amount})
      ON CONFLICT (tenant_id, year_month)
      DO UPDATE SET used = quota_usage.used + ${amount}
    `;
  },
};
