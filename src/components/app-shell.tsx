"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertCircle, Building2, ClipboardList, FileText, HardHat, LayoutDashboard, Menu, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { AuthControl } from "@/components/auth-control";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/projects", label: "Projetos", icon: Building2 },
  { href: "/issues", label: "Pendências", icon: ClipboardList },
  { href: "/contractors", label: "Terceirizados", icon: HardHat },
  { href: "/updates", label: "Atualizações", icon: Activity },
  { href: "/documents", label: "Documentos", icon: FileText },
];

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && window.location.pathname !== "/login") {
        const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(`/login?next=${encodeURIComponent(returnPath)}`);
      }
    });
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && window.location.pathname !== "/login") window.location.reload();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => { subscription.unsubscribe(); window.removeEventListener("pageshow", handlePageShow); };
  }, []);
  if (pathname === "/login") return <div className="min-h-screen bg-canvas px-4 py-10 text-ink sm:py-16"><main>{children}</main></div>;
  const current = links.find((item) => item.href === pathname) ?? links.find((item) => pathname.startsWith(item.href) && item.href !== "/") ?? links[0];
  const sidebar = <>
    <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white"><Building2 size={19} strokeWidth={2.3} /></div><div><div className="text-sm font-semibold tracking-tight text-white">Obra<span className="text-emerald-400">.flux</span></div><div className="mt-0.5 text-[10px] font-medium uppercase tracking-[.16em] text-slate-300">Gestão de projetos</div></div></div>
    <div className="px-4 pt-7"><div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-300">Workspace</div><nav aria-label="Seções do projeto" className="space-y-1">{links.map(({ href, label, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname === href || (href === "/projects" && pathname.startsWith("/projects/")); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition ${active ? "bg-white/10 font-medium text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon size={17} strokeWidth={1.8} /><span className="flex-1">{label}</span></Link>; })}</nav></div>
    <div className="mt-auto p-4"><div className="rounded-lg border border-white/10 bg-white/[.04] p-3"><div className="flex items-center gap-2 text-xs font-medium text-white"><AlertCircle size={14} className="text-amber-400" /> Acompanhamento de obras</div><Link href="/projects" className="mt-2 block pl-[22px] text-[11px] text-slate-300 hover:text-white">Ver projetos <span aria-hidden>→</span></Link></div><div className="mt-4 border-t border-white/10 pt-3"><div className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs text-slate-300"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900 text-[11px] font-semibold text-emerald-200">{userEmail?.slice(0, 2).toUpperCase() ?? "US"}</div><span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-200">{userEmail ?? "Conta autenticada"}</span><span className="mt-0.5 block text-[10px]">Usuário autenticado</span></span><AuthControl authenticated /></div></div></div>
  </>;
  return <div className="min-h-screen bg-canvas text-ink"><aside aria-label="Navegação principal" className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#172522] lg:flex">{sidebar}</aside>{open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} /><aside aria-label="Navegação principal" className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[#172522]">{sidebar}</aside></div>}<div className="lg:pl-[248px]"><header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-7"><div className="flex items-center gap-3"><button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu size={20} /></button><div className="text-sm font-semibold text-ink">{current.label}</div><span className="hidden text-xs text-slate-300 sm:block">/</span><span className="hidden text-xs text-slate-500 sm:block">Portfólio 2026</span></div><div className="flex items-center gap-2 sm:gap-4"><AuthControl authenticated /><Link href="/projects" aria-label="Buscar projetos" className="hidden rounded-md p-2 text-slate-500 hover:bg-slate-100 sm:block"><Search size={17} /></Link><Link href={`/updates?next=${encodeURIComponent(pathname)}`} className="hidden items-center gap-2 rounded-md bg-forest px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-800 sm:flex"><Plus size={15} /> Nova atualização</Link><Link href={`/updates?next=${encodeURIComponent(pathname)}`} aria-label="Nova atualização" className="flex h-9 w-9 items-center justify-center rounded-md bg-forest text-white sm:hidden"><Plus size={18} /></Link></div></header><main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">{children}</main></div><footer className="pb-6 pt-1 text-center text-[10px] text-slate-500 lg:pl-[248px]">Obra.flux · Ambiente de demonstração · Todos os dados são fictícios</footer></div>;
}
