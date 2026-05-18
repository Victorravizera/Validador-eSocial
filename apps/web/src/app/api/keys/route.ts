import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

async function getApiKey() {
  const store = await cookies();
  return store.get("esocial_qa_key")?.value;
}

// POST /api/keys — cria nova API Key
export async function POST(request: Request) {
  const apiKey = await getApiKey();
  if (!apiKey) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE}/v1/auth/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
