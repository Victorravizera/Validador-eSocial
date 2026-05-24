import type { FastifyInstance } from "fastify";
import { ValidateEventRequestSchema } from "../../../../../shared/types.js";
import { validateEvent } from "../../modules/validation/engine/index.js";
import { requireApiKey, requireQuota } from "../middlewares/auth.js";
import { ValidationError } from "../../../../../shared/errors.js";
import { TenantRepository } from "../../modules/tenant/tenant.repository.js";
import { getDb } from "../../infra/db/index.js";

export async function validateEventRoute(app: FastifyInstance): Promise<void> {
  app.post("/validate/event", { preHandler: [requireApiKey, requireQuota], schema: { tags: ["Validação"] } },
    async (request, reply) => {
      const parsed = ValidateEventRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      }
      const result = validateEvent(parsed.data);
      const tenantId = request.tenant!.id;

      Promise.all([
        TenantRepository.incrementQuota(tenantId, 1),
        getDb()`
          INSERT INTO validation_logs (tenant_id, event_id, status, score, total_rules, passed_rules, issue_count, duration_ms)
          VALUES (${tenantId}, ${result.eventId}, ${result.status}, ${result.score},
                  ${result.totalRules}, ${result.passedRules}, ${result.issues.length}, ${result.durationMs})
        `.catch(() => {}),
      ]).catch(() => {});

      return reply.status(200).send(result);
    });
}
