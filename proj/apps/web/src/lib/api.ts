import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const store = await cookies();
  const apiKey = store.get("esocial_qa_key")?.value;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-API-Key": apiKey } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { code?: string; message?: string } };
    throw new ApiError(res.status, body.error?.code ?? "API_ERROR", body.error?.message ?? "Erro");
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => req<{
    id: string; name: string; plan: string;
    quota: { monthly: number; used: number; remaining: number; percentUsed: number };
  }>("/v1/me"),

  history: (p?: { page?: number; eventId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (p?.page) qs.set("page", String(p.page));
    if (p?.eventId) qs.set("eventId", p.eventId);
    if (p?.status) qs.set("status", p.status);
    return req<{
      data: Array<{ id: string; eventId: string; status: string; score: number; issueCount: number; durationMs: number; createdAt: string }>;
      pagination: { page: number; total: number; totalPages: number };
    }>(`/v1/history?${qs}`);
  },

  apiKeys: () => req<Array<{ id: string; name: string | null; lastUsedAt: string | null; createdAt: string }>>("/v1/auth/api-keys"),

  validateEvent: (body: { eventId: string; payload: Record<string, unknown> }) =>
    req("/v1/validate/event", { method: "POST", body: JSON.stringify(body) }),
};
