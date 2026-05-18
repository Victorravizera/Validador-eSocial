import { api, ApiError } from "../../lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; eventId?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const { status, eventId } = searchParams;

  let history;
  try {
    history = await api.history({ page, status, eventId });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }

  const { data, pagination } = history;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
        <p className="text-slate-400 text-sm mt-1">Últimas validações dos 30 dias</p>
      </div>

      {/* Filtros */}
      <form className="flex gap-3 flex-wrap">
        <select name="eventId" defaultValue={eventId ?? ""} className="input w-40 text-sm">
          <option value="">Todos eventos</option>
          {["S-2200", "S-2230", "S-1200"].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="input w-36 text-sm">
          <option value="">Todos status</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
          <option value="WARN">WARN</option>
        </select>
        <button type="submit" className="btn-primary text-sm px-4 py-2">Filtrar</button>
        {(status || eventId) && (
          <Link href="/history" className="btn-ghost text-sm">Limpar</Link>
        )}
      </form>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border">
            <tr className="text-left text-slate-500">
              {["Evento", "Status", "Score", "Regras", "Erros", "Duração", "Data"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma validação encontrada
                </td>
              </tr>
            ) : data.map((r) => (
              <tr key={r.id} className="text-slate-300 hover:bg-surface-raised transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand-500">{r.eventId}</td>
                <td className="px-4 py-3">
                  <span className={r.status === "PASS" ? "badge-pass" : r.status === "FAIL" ? "badge-fail" : "badge-warn"}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">{r.score}%</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {(r as { passedRules: number }).passedRules}/{(r as { totalRules: number }).totalRules}
                </td>
                <td className="px-4 py-3 font-mono">{r.issueCount}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.durationMs}ms</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(r.createdAt).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/history?page=${p}${status ? `&status=${status}` : ""}${eventId ? `&eventId=${eventId}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono transition-colors ${p === page ? "bg-brand-500 text-white" : "text-slate-400 hover:text-white hover:bg-surface-raised"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
