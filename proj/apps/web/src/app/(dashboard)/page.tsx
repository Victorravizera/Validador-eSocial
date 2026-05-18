import { api } from "../lib/api";
import { redirect } from "next/navigation";
import { ApiError } from "../lib/api";
import { ScoreChart } from "../components/charts/ScoreChart";

export default async function DashboardPage() {
  let me, history;
  try {
    [me, history] = await Promise.all([api.me(), api.history({ page: 1 })]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }

  const { quota } = me;
  const recent = history.data.slice(0, 5);

  const statusCount = history.data.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  const avgScore = history.data.length
    ? Math.round(history.data.reduce((a, r) => a + r.score, 0) / history.data.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Bem-vindo, <span className="text-slate-200">{me.name}</span> · Plano <span className="text-brand-500 capitalize">{me.plan}</span></p>
      </div>

      {/* Quota */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Quota Mensal</h2>
          <span className="text-xs text-slate-500">{quota.used.toLocaleString("pt-BR")} / {quota.monthly.toLocaleString("pt-BR")} validações</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${quota.percentUsed > 90 ? "bg-red-500" : quota.percentUsed > 70 ? "bg-yellow-500" : "bg-brand-500"}`}
            style={{ width: `${Math.min(quota.percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{quota.percentUsed}% utilizado</span>
          <span>{quota.remaining.toLocaleString("pt-BR")} restantes</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total (30d)", value: history.pagination.total },
          { label: "Score Médio", value: `${avgScore}%` },
          { label: "Aprovados", value: statusCount["PASS"] ?? 0, color: "text-emerald-400" },
          { label: "Com Erros", value: statusCount["FAIL"] ?? 0, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="card py-4">
            <div className={`text-2xl font-bold font-mono ${s.color ?? "text-white"}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de score */}
      {history.data.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Score por Validação (últimas 30)</h2>
          <ScoreChart data={history.data.slice(0, 30).reverse()} />
        </div>
      )}

      {/* Recentes */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Validações Recentes</h2>
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Nenhuma validação ainda. Use a API ou o validador manual.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-surface-border">
                <th className="pb-2 font-medium">Evento</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">Erros</th>
                <th className="pb-2 font-medium">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {recent.map((r) => (
                <tr key={r.id} className="text-slate-300">
                  <td className="py-2.5 font-mono text-xs text-brand-500">{r.eventId}</td>
                  <td className="py-2.5">
                    <span className={r.status === "PASS" ? "badge-pass" : r.status === "FAIL" ? "badge-fail" : "badge-warn"}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono">{r.score}%</td>
                  <td className="py-2.5 font-mono">{r.issueCount}</td>
                  <td className="py-2.5 text-slate-500 text-xs">
                    {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
