import { setApiKeyAction } from "../../lib/actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-brand-500 text-3xl font-bold font-mono">⬡</span>
            <span className="text-2xl font-bold text-white">eSocial QA</span>
          </div>
          <p className="text-slate-400 text-sm">Validação automatizada de eventos trabalhistas</p>
        </div>

        <div className="card">
          <h1 className="text-lg font-semibold text-white mb-1">Acessar dashboard</h1>
          <p className="text-slate-400 text-sm mb-6">
            Insira sua API Key gerada no registro.
          </p>

          <form action={setApiKeyAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                API Key
              </label>
              <input
                name="apiKey"
                type="password"
                placeholder="eqa_..."
                className="input font-mono"
                required
                autoComplete="off"
              />
              <p className="text-xs text-slate-500 mt-1">
                Gerada em <code className="text-slate-400">POST /v1/auth/register</code>
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border">
            <p className="text-xs text-slate-500 text-center">
              Ainda não tem conta?{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:3000/docs"}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-500 hover:underline"
              >
                Veja a documentação da API
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
