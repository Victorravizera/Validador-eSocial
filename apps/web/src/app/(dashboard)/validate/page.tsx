"use client";
import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Play } from "lucide-react";

const EVENTOS = ["S-2200", "S-2230", "S-1200"];

const EXEMPLOS: Record<string, object> = {
  "S-2200": {
    cpfTrab: "529.982.247-25",
    nmTrab: "Maria da Silva Santos",
    dtNascto: "1990-05-20",
    dtAdm: "2024-01-15",
    tpRegTrab: "1",
    codCateg: "101",
    vrSalFx: 3500,
    undSalFixo: "1",
  },
  "S-2230": {
    cpfTrab: "529.982.247-25",
    dtIniAfast: "2024-02-01",
    codMotAfast: "03",
  },
  "S-1200": {
    perApur: "2024-03",
    cpfTrab: "529.982.247-25",
    tpRegTrab: "1",
    vrRemun: 3500,
    vrDescInss: 315,
    vrDescIrrf: 0,
  },
};

interface Issue {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
}

interface Result {
  eventId: string;
  status: "PASS" | "FAIL" | "WARN";
  score: number;
  issues: Issue[];
  passedRules: number;
  totalRules: number;
  durationMs: number;
}

export default function ValidatePage() {
  const [eventId, setEventId] = useState("S-2200");
  const [payload, setPayload] = useState(JSON.stringify(EXEMPLOS["S-2200"], null, 2));
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadExample = (id: string) => {
    setEventId(id);
    setPayload(JSON.stringify(EXEMPLOS[id] ?? {}, null, 2));
    setResult(null);
    setError(null);
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(payload);
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, payload: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Erro na validação");
      } else {
        setResult(data);
      }
    } catch {
      setError("Payload inválido — verifique o JSON");
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = result?.status === "PASS"
    ? <CheckCircle className="text-emerald-400" size={20} />
    : result?.status === "FAIL"
    ? <XCircle className="text-red-400" size={20} />
    : <AlertTriangle className="text-yellow-400" size={20} />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Validar Evento</h1>
        <p className="text-slate-400 text-sm mt-1">Teste um evento eSocial manualmente antes de integrar via API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Evento</label>
              <div className="flex gap-2 flex-wrap">
                {EVENTOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => loadExample(e)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                      eventId === e
                        ? "bg-brand-500 text-white"
                        : "bg-surface border border-surface-border text-slate-400 hover:text-white"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={16}
                className="input font-mono text-xs resize-none"
                spellCheck={false}
              />
            </div>

            <button
              onClick={run}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Play size={16} />
              {loading ? "Validando..." : "Executar Validação"}
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          {error && (
            <div className="card border-red-500/30 bg-red-500/5">
              <p className="text-sm text-red-400 font-medium">Erro</p>
              <p className="text-sm text-slate-300 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <>
              {/* Score card */}
              <div className={`card border ${
                result.status === "PASS" ? "border-emerald-500/30 bg-emerald-500/5"
                : result.status === "FAIL" ? "border-red-500/30 bg-red-500/5"
                : "border-yellow-500/30 bg-yellow-500/5"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcon}
                    <span className="font-bold text-white">{result.status}</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-white">{result.score}%</span>
                </div>
                <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.status === "PASS" ? "bg-emerald-400"
                      : result.status === "FAIL" ? "bg-red-400"
                      : "bg-yellow-400"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>{result.passedRules}/{result.totalRules} regras passaram</span>
                  <span>{result.durationMs}ms</span>
                </div>
              </div>

              {/* Issues */}
              {result.issues.length === 0 ? (
                <div className="card text-center py-8">
                  <CheckCircle className="text-emerald-400 mx-auto mb-2" size={32} />
                  <p className="text-slate-300 font-medium">Nenhum problema encontrado</p>
                  <p className="text-slate-500 text-sm mt-1">Evento válido para envio ao eSocial</p>
                </div>
              ) : (
                <div className="card p-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-border">
                    <span className="text-sm font-semibold text-slate-300">
                      {result.issues.length} problema{result.issues.length !== 1 ? "s" : ""} encontrado{result.issues.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="divide-y divide-surface-border">
                    {result.issues.map((issue, i) => (
                      <div key={i} className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className={issue.severity === "error" ? "badge-fail" : "badge-warn"}>
                            {issue.severity === "error" ? "ERRO" : "AVISO"}
                          </span>
                          <code className="text-xs text-brand-500 font-mono mt-0.5">{issue.field}</code>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{issue.message}</p>
                        <p className="text-xs text-slate-600 mt-0.5 font-mono">{issue.code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!result && !error && (
            <div className="card text-center py-16 border-dashed">
              <Play className="text-slate-600 mx-auto mb-3" size={32} />
              <p className="text-slate-500">Execute a validação para ver o resultado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
