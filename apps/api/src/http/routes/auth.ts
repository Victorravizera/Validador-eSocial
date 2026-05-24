import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../modules/auth/auth.service.js";
import { ApiKeyRepository } from "../../modules/auth/apikey.repository.js";
import { requireApiKey } from "../middlewares/auth.js";

const RegisterSchema = z.object({
  tenantName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, "Deve ter maiúscula").regex(/[0-9]/, "Deve ter número"),
  plan: z.enum(["starter", "pro", "enterprise"]).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/auth/register", { schema: { tags: ["Auth"] } }, async (request, reply) => {
    const body = RegisterSchema.parse(request.body);
    const result = await AuthService.register({
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
    const result = await AuthService.login({
      email: body.email,
      password: body.password,
    });
    return reply.status(200).send(result);
  });

  app.get("/auth/api-keys", { preHandler: [requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
    const keys = await ApiKeyRepository.listByTenant(request.tenant!.id);
    return reply.send(keys.map((k) => ({
      id: k.id, name: k.name, lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt, createdAt: k.createdAt,
    })));
  });

  app.post("/auth/api-keys", { preHandler: [requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
    const body = z.object({ name: z.string().max(100).optional() }).parse(request.body ?? {});
    const { record, plainKey } = await ApiKeyRepository.create(request.tenant!.id, body.name);
    return reply.status(201).send({
      id: record.id, name: record.name, apiKey: plainKey,
      warning: "Guarde sua API Key agora. Ela não será exibida novamente.",
      createdAt: record.createdAt,
    });
  });

  app.delete("/auth/api-keys/:id", { preHandler: [requireApiKey], schema: { tags: ["Auth"] } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await ApiKeyRepository.revoke(id, request.tenant!.id);
    return reply.status(204).send();
  });
}