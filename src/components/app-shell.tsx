"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  Factory,
  Gauge,
  Menu,
  PackageCheck,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Visão geral", icon: Gauge },
  { href: "/quotes", label: "Orçamentos", icon: ClipboardList },
  { href: "/orders", label: "Pedidos", icon: PackageCheck },
  { href: "/production", label: "Produção", icon: Factory },
  { href: "/scheduling", label: "Planejamento", icon: Activity },
  { href: "/customers", label: "Clientes", icon: UsersRound },
  { href: "/materials", label: "Materiais", icon: Boxes },
  { href: "/machines", label: "Máquinas", icon: Factory },
  { href: "/reports", label: "Relatórios", icon: ChartNoAxesCombined },
];

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={close}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] transition-colors ${
              active
                ? "bg-slate-100 font-medium text-slate-950"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function pageLabel(pathname: string) {
  if (pathname === "/") return "Visão geral";
  return navigation.find((item) => item.href === pathname)?.label ?? (pathname === "/settings" ? "Configurações" : "CutFlow");
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CutFlow, visão geral">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white">
        <span className="text-[11px] font-semibold tracking-tight">CF</span>
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.03em] text-slate-950">CutFlow</span>
    </Link>
  );
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f8f8] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] border-r border-slate-200 bg-white px-3.5 py-5 lg:flex lg:flex-col">
        <div className="px-2 pb-7"><Brand /></div>
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
        <Navigation />
        <div className="mt-auto border-t border-slate-100 pt-4">
          <Link href="/settings" className="flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-950">
            <Settings2 size={17} strokeWidth={1.8} aria-hidden="true" />
            Configurações
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu principal">
          <button className="absolute inset-0 bg-slate-950/30" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl">
            <div className="mb-7 flex items-center justify-between px-1"><Brand /><button onClick={() => setMenuOpen(false)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar menu"><X size={18} /></button></div>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
            <Navigation close={() => setMenuOpen(false)} />
            <div className="mt-auto border-t border-slate-100 pt-4"><Link href="/settings" onClick={() => setMenuOpen(false)} className="flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] text-slate-600 hover:bg-slate-50"><Settings2 size={17} />Configurações</Link></div>
          </aside>
        </div>
      )}

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="-ml-2 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu"><Menu size={19} /></button>
            <span className="text-[13px] font-medium text-slate-700">{pageLabel(pathname)}</span>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50" aria-label="Workspace CutFlow">
            <span className="hidden sm:inline">CutFlow</span><ChevronDown size={14} className="text-slate-400" />
          </button>
        </header>
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1320px] px-4 py-8 sm:px-7 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
