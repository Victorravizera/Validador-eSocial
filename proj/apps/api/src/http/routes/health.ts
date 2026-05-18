import type { FastifyInstance } from "fastify";

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get("/health/live", {
    schema: { tags: ["Health"], description: "Liveness probe" },
  }, async (_request, reply) => reply.status(200).send({ status: "ok" }));

  app.get("/health/ready", {
    schema: { tags: ["Health"], description: "Readiness probe" },
  }, async (_request, reply) =>
    reply.status(200).send({ status: "ok", checks: { api: "ok" } })
  );
}
