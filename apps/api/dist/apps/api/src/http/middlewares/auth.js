import { UnauthorizedError, ForbiddenError } from "../../../../../shared/errors.js";
import { ApiKeyRepository } from "../../modules/auth/apikey.repository.js";
import { TenantRepository } from "../../modules/tenant/tenant.repository.js";
export async function requireApiKey(request, _reply) {
    const rawKey = request.headers["x-api-key"];
    if (!rawKey || typeof rawKey !== "string" || rawKey.trim() === "") {
        throw new UnauthorizedError("Header X-API-Key ausente");
    }
    const tenantId = await ApiKeyRepository.validate(rawKey);
    request.tenant = await TenantRepository.findById(tenantId);
}
export async function requireQuota(request, _reply) {
    const { tenant } = request;
    if (!tenant)
        throw new UnauthorizedError();
    if (tenant.usedThisMonth >= tenant.monthlyQuota) {
        throw new ForbiddenError(`Quota mensal atingida (${tenant.monthlyQuota.toLocaleString("pt-BR")} validações). Faça upgrade do plano.`);
    }
}
