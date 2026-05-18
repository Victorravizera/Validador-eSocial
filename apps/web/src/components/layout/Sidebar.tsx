"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Key, CheckSquare, LogOut } from "lucide-react";
import { logoutAction } from "../../lib/actions";
import { clsx } from "clsx";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/validate", label: "Validar Evento", icon: CheckSquare },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/api-keys", label: "API Keys", icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-surface-border bg-surface flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="text-brand-500 text-xl font-bold font-mono">⬡</span>
          <span className="font-bold text-white text-sm">eSocial QA</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-brand-500/10 text-brand-500 font-medium"
                : "text-slate-400 hover:text-slate-100 hover:bg-surface-raised"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-surface-border">
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-surface-raised w-full transition-colors">
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
