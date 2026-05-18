import { randomBytes, pbkdf2Sync, timingSafeEqual, createHmac } from "node:crypto";
import { getDb } from "../../infra/db/index.js";
import { TenantRepository } from "../tenant/tenant.repository.js";
import { ApiKeyRepository } from "./apikey.repository.js";
import { config } from "../../../../config/index.js";
import { UnauthorizedError, AppError } from "../../../../shared/errors.js";
import { logger } from "../../../../shared/logger.js";
import type { Plan } from "../../../../shared/types.js";

export interface RegisterInput {
  tenantName: string;
  email: string;
  password: string;
  plan?: Plan;
}

export interface RegisterResult {
  tenantId: string;
  apiKey: string; // plain — exibir uma vez
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  tenantId: string;
  accessToken: string;
  expiresIn: number;
}

export const AuthService = {
  async register(input: RegisterInput): Promise<RegisterResult> {
    const db = getDb();

    const [existing] = await db<Array<{ id: string }>>`
      SELECT id FROM tenant_users WHERE email = ${input.email} LIMIT 1
    `;
    if (existing) throw new AppError("E-mail já cadastrado", "VALIDATION_ERROR", 409);

    const tenant = await TenantRepository.create({
      name: input.tenantName,
      plan: input.plan ?? "starter",
    });

    const { hash, salt } = hashPassword(input.password);
    await db`
      INSERT INTO tenant_users (tenant_id, email, password_hash, password_salt)
      VALUES (${tenant.id}, ${input.email}, ${hash}, ${salt})
    `;

    const { plainKey } = await ApiKeyRepository.create(tenant.id, "Default Key");
    logger.info({ tenantId: tenant.id, plan: tenant.plan }, "auth:registered");
    return { tenantId: tenant.id, apiKey: plainKey };
  },

  async login(input: LoginInput): Promise<LoginResult> {
    const db = getDb();

    const [user] = await db<
      Array<{ tenantId: string; passwordHash: string; passwordSalt: string }>
    >`
      SELECT tenant_id AS "tenantId",
             password_hash AS "passwordHash",
             password_salt AS "passwordSalt"
      FROM tenant_users WHERE email = ${input.email} LIMIT 1
    `;

    // Deriva sempre — tempo constante (anti timing attack)
    const dummySalt = randomBytes(16).toString("hex");
    const candidateHash = deriveKey(input.password, user?.passwordSalt ?? dummySalt);
    const storedHash = user?.passwordHash ?? randomBytes(32).toString("hex");

    const valid =
      user !== undefined &&
      timingSafeEqual(
        Buffer.from(candidateHash, "hex"),
        Buffer.from(storedHash, "hex")
      );

    if (!valid) throw new UnauthorizedError("Credenciais inválidas");

    const { token, expiresIn } = issueJwt(user.tenantId);
    logger.info({ tenantId: user.tenantId }, "auth:login");
    return { tenantId: user.tenantId, accessToken: token, expiresIn };
  },
};

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  return { hash: deriveKey(password, salt), salt };
}

function deriveKey(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 32, "sha256").toString("hex");
}

const JWT_EXPIRES_SECONDS = 15 * 60;

function issueJwt(tenantId: string): { token: string; expiresIn: number } {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ sub: tenantId, iat: now, exp: now + JWT_EXPIRES_SECONDS })
  ).toString("base64url");
  const sig = createHmac("sha256", config.auth.jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return { token: `${header}.${payload}.${sig}`, expiresIn: JWT_EXPIRES_SECONDS };
}
