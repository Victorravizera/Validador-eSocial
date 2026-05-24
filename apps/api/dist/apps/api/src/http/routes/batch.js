import { ValidateBatchRequestSchema } from "../../../../../shared/types.js";
import { validateBatch } from "../../modules/validation/engine/index.js";
import { requireApiKey, requireQuota } from "../middlewares/auth.js";
import { ValidationError, BatchTooLargeError } from "../../../../../shared/errors.js";
import { TenantRepository } from "../../modules/tenant/tenant.repository.js";
const BATCH_LIMIT = 500;
export async function validateBatchRoute(app) {
    app.post("/validate/batch", { preHandler: [requireApiKey, requireQuota], schema: { tags: ["Validação"] } }, async (request, reply) => {
        const body = request.body;
        if (Array.isArray(body?.events) && body.events.length > BATCH_LIMIT)
            throw new BatchTooLargeError(BATCH_LIMIT);
        const parsed = ValidateBatchRequestSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        }
        const result = validateBatch(parsed.data);
        TenantRepository.incrementQuota(request.tenant.id, result.totalEvents).catch(() => { });
        return reply.status(200).send(result);
    });
}
