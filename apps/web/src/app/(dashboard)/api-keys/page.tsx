import { api, ApiError } from "../../../lib/api";
import { ApiKeysList } from "../../../components/ui/ApiKeysList";
import { redirect } from "next/navigation";


export default async function ApiKeysPage() {
  let keys;
  try {
    keys = await api.apiKeys();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie as chaves de acesso à API. Cada chave é exibida uma única vez na criação.
        </p>
      </div>
      <ApiKeysList initialKeys={keys} />
    </div>
  );
}
