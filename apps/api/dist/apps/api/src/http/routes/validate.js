"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventRoute = validateEventRoute;
const types_js_1 = require("../../../../../shared/types.js");
const index_js_1 = require("../../modules/validation/engine/index.js");
const auth_js_1 = require("../middlewares/auth.js");
const errors_js_1 = require("../../../../../shared/errors.js");
const tenant_repository_js_1 = require("../../modules/tenant/tenant.repository.js");
const index_js_2 = require("../../infra/db/index.js");
async function validateEventRoute(app) {
    app.post("/validate/event", { preHandler: [auth_js_1.requireApiKey, auth_js_1.requireQuota], schema: { tags: ["Validação"] } }, async (request, reply) => {
        const parsed = types_js_1.ValidateEventRequestSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_js_1.ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        }
        const result = (0, index_js_1.validateEvent)(parsed.data);
        const tenantId = request.tenant.id;
        Promise.all([
            tenant_repository_js_1.TenantRepository.incrementQuota(tenantId, 1),
            (0, index_js_2.getDb)() `
          INSERT INTO validation_logs (tenant_id, event_id, status, score, total_rules, passed_rules, issue_count, duration_ms)
          VALUES (${tenantId}, ${result.eventId}, ${result.status}, ${result.score},
                  ${result.totalRules}, ${result.passedRules}, ${result.issues.length}, ${result.durationMs})
        `.catch(() => { }),
        ]).catch(() => { });
        return reply.status(200).send(result);
    });
}
