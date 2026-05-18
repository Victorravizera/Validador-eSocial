"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setApiKeyAction(formData: FormData) {
  const apiKey = (formData.get("apiKey") as string)?.trim();
  if (!apiKey || !apiKey.startsWith("eqa_")) {
    return { error: "API Key inválida. Deve começar com eqa_" };
  }

  // Valida a key antes de salvar o cookie
  const res = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000"}/v1/me`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) return { error: "API Key não reconhecida. Verifique e tente novamente." };

  const store = await cookies();
  store.set("esocial_qa_key", apiKey, {
    httpOnly: true,                                    // inacessível ao JS do browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete("esocial_qa_key");
  redirect("/login");
}
