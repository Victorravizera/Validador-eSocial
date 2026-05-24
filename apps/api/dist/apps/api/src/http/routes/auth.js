"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const auth_service_js_1 = require("../../modules/auth/auth.service.js");
const apikey_repository_js_1 = require("../../modules/auth/apikey.repository.js");
const auth_js_1 = require("../middlewares/auth.js");
const RegisterSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).regex(/[A-Z]/, "Deve ter maiúscula").regex(/[0-9]/, "Deve ter número"),
    plan: zod_1.z.enum(["starter", "pro", "enterprise"]).optional(),
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
async function authRoutes(app) {
    app.post("/auth/register", { schema: { tags: ["Auth"] } }, async (request, reply) => {
        const body = RegisterSchema.parse(request.body);
        const result = await auth_service_js_1.AuthService.register({
            tenantName: body.tenantName,
            email: body.email,
            password: body.password,
            plan: body.plan,
        });
        return reply.status(201).send({
            tenantId: result.tenantId,
            apiKey: result.apiKey,
            warning: "Guarde sua API Key agora. Ela não será exibida novamente.",
        });
    });
    app.post("/auth/login", { schema: { tags: ["Auth"] } }, async (request, reply) => {
        const body = LoginSchema.parse(request.body);
        const result = await auth_service_js_1.AuthService.login({
            email: body.email,
            password: body.password,
        });
        return reply.status(200).send(result);
    });
    app.get("/auth/api-keys", { preHandler: [auth_js_1.requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
        const keys = await apikey_repository_js_1.ApiKeyRepository.listByTenant(request.tenant.id);
        return reply.send(keys.map((k) => ({
            id: k.id, name: k.name, lastUsedAt: k.lastUsedAt,
            expiresAt: k.expiresAt, createdAt: k.createdAt,
        })));
    });
    app.post("/auth/api-keys", { preHandler: [auth_js_1.requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
        const body = zod_1.z.object({ name: zod_1.z.string().max(100).optional() }).parse(request.body ?? {});
        const { record, plainKey } = await apikey_repository_js_1.ApiKeyRepository.create(request.tenant.id, body.name);
        return reply.status(201).send({
            id: record.id, name: record.name, apiKey: plainKey,
            warning: "Guarde sua API Key agora. Ela não será exibida novamente.",
            createdAt: record.createdAt,
        });
    });
    app.delete("/auth/api-keys/:id", { preHandler: [auth_js_1.requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
        const { id } = request.params;
        await apikey_repository_js_1.ApiKeyRepository.revoke(id, request.tenant.id);
        return reply.status(204).send();
    });
}
