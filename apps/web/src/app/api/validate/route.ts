import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const store = await cookies();
  const apiKey = store.get("esocial_qa_key")?.value;
  if (!apiKey) return NextResponse.json({ error: { message: "Não autenticado" } }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE}/v1/validate/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
