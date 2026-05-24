"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBatchRoute = validateBatchRoute;
const types_js_1 = require("../../../../../shared/types.js");
const index_js_1 = require("../../modules/validation/engine/index.js");
const auth_js_1 = require("../middlewares/auth.js");
const errors_js_1 = require("../../../../../shared/errors.js");
const tenant_repository_js_1 = require("../../modules/tenant/tenant.repository.js");
const BATCH_LIMIT = 500;
async function validateBatchRoute(app) {
    app.post("/validate/batch", { preHandler: [auth_js_1.requireApiKey, auth_js_1.requireQuota], schema: { tags: ["Validação"] } }, async (request, reply) => {
        const body = request.body;
        if (Array.isArray(body?.events) && body.events.length > BATCH_LIMIT)
            throw new errors_js_1.BatchTooLargeError(BATCH_LIMIT);
        const parsed = types_js_1.ValidateBatchRequestSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_js_1.ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        }
        const result = (0, index_js_1.validateBatch)(parsed.data);
        tenant_repository_js_1.TenantRepository.incrementQuota(request.tenant.id, result.totalEvents).catch(() => { });
        return reply.status(200).send(result);
    });
}
