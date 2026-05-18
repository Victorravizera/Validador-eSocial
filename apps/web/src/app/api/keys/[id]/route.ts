import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

// DELETE /api/keys/[id] — revoga API Key
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const store = await cookies();
  const apiKey = store.get("esocial_qa_key")?.value;
  if (!apiKey) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const res = await fetch(`${API_BASE}/v1/auth/api-keys/${params.id}`, {
    method: "DELETE",
    headers: { "X-API-Key": apiKey },
  });

  return new NextResponse(null, { status: res.status });
}
