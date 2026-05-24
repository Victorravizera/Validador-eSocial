"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApiKey = requireApiKey;
exports.requireQuota = requireQuota;
const errors_js_1 = require("../../../../../shared/errors.js");
const apikey_repository_js_1 = require("../../modules/auth/apikey.repository.js");
const tenant_repository_js_1 = require("../../modules/tenant/tenant.repository.js");
async function requireApiKey(request, _reply) {
    const rawKey = request.headers["x-api-key"];
    if (!rawKey || typeof rawKey !== "string" || rawKey.trim() === "") {
        throw new errors_js_1.UnauthorizedError("Header X-API-Key ausente");
    }
    const tenantId = await apikey_repository_js_1.ApiKeyRepository.validate(rawKey);
    request.tenant = await tenant_repository_js_1.TenantRepository.findById(tenantId);
}
async function requireQuota(request, _reply) {
    const { tenant } = request;
    if (!tenant)
        throw new errors_js_1.UnauthorizedError();
    if (tenant.usedThisMonth >= tenant.monthlyQuota) {
        throw new errors_js_1.ForbiddenError(`Quota mensal atingida (${tenant.monthlyQuota.toLocaleString("pt-BR")} validações). Faça upgrade do plano.`);
    }
}
