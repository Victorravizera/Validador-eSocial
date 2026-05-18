"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface Key {
  id: string;
  name: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeysList({ initialKeys }: { initialKeys: Key[] }) {
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || undefined }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setNewKey(data.apiKey);
        setKeys((prev) => [{ id: data.id, name: data.name, lastUsedAt: null, createdAt: data.createdAt }, ...prev]);
        setNewKeyName("");
      }
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revogar esta API Key? A ação não pode ser desfeita.")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Aviso de nova key */}
      {newKey && (
        <div className="card border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-400 mb-1">✓ Nova API Key criada</p>
              <p className="text-xs text-slate-400 mb-2">Copie agora — ela não será exibida novamente.</p>
              <code className="text-xs font-mono text-emerald-300 break-all">{newKey}</code>
            </div>
            <button onClick={copy} className="shrink-0 btn-ghost text-emerald-400 hover:text-emerald-300">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Criar nova key */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Criar nova API Key</h2>
        <div className="flex gap-3">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nome (ex: CI Pipeline)"
            className="input text-sm"
          />
          <button onClick={create} disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} />
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border">
            <tr className="text-left text-slate-500">
              {["Nome", "Último uso", "Criada em", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhuma API Key</td>
              </tr>
            ) : keys.map((k) => (
              <tr key={k.id} className="text-slate-300">
                <td className="px-4 py-3">{k.name ?? <span className="text-slate-500 italic">sem nome</span>}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("pt-BR") : "Nunca usada"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(k.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => revoke(k.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
