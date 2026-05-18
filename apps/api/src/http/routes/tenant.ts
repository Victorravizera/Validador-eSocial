import type { FastifyInstance } from "fastify";
import { requireApiKey } from "../middlewares/auth.js";
import { getDb } from "../../infra/db/index.js";

export async function meRoute(app: FastifyInstance): Promise<void> {
  app.get("/me", {
    preHandler: [requireApiKey],
    schema: { tags: ["Tenant"], security: [{ apiKey: [] }], description: "Dados do tenant e quota" },
  }, async (request, reply) => {
    const { tenant } = request;
    const remaining = Math.max(0, tenant!.monthlyQuota - tenant!.usedThisMonth);
    const percentUsed = Math.round((tenant!.usedThisMonth / tenant!.monthlyQuota) * 100);
    return reply.send({
      id: tenant!.id, name: tenant!.name, plan: tenant!.plan,
      quota: { monthly: tenant!.monthlyQuota, used: tenant!.usedThisMonth, remaining, percentUsed },
    });
  });
}

export async function historyRoute(app: FastifyInstance): Promise<void> {
  app.get("/history", {
    preHandler: [requireApiKey],
    schema: { tags: ["Validação"], security: [{ apiKey: [] }], description: "Histórico de validações (30 dias)" },
  }, async (request, reply) => {
    const db = getDb();
    const { page = 1, limit = 20, eventId, status } = request.query as {
      page?: number; limit?: number; eventId?: string; status?: string;
    };
    const offset = (page - 1) * limit;
    const tenantId = request.tenant!.id;

    const rows = await db`
      SELECT id, event_id AS "eventId", status, score,
             total_rules AS "totalRules", passed_rules AS "passedRules",
             issue_count AS "issueCount", duration_ms AS "durationMs",
             created_at AS "createdAt"
      FROM validation_logs
      WHERE tenant_id = ${tenantId}
        ${eventId ? db`AND event_id = ${eventId}` : db``}
        ${status ? db`AND status = ${status}` : db``}
        AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ total }] = await db<[{ total: number }]>`
      SELECT COUNT(*)::int AS total FROM validation_logs
      WHERE tenant_id = ${tenantId} AND created_at > NOW() - INTERVAL '30 days'
    `;

    return reply.send({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });
}
