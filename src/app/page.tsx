import { Boxes, ClipboardList, Factory } from "lucide-react";

const foundations = [
  { title: "Orçamentos", detail: "Base para estruturar propostas e custos de fabricação.", icon: ClipboardList },
  { title: "Produção", detail: "Base para organizar pedidos e acompanhar a operação.", icon: Factory },
  { title: "Capacidade", detail: "Base para planejar recursos, máquinas e prazos.", icon: Boxes },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[980px]">
      <div className="border-b border-slate-200 pb-7 sm:pb-8">
        <div className="text-xs font-medium text-slate-500">CutFlow</div>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[32px]">Orçamentos e produção industrial</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Base do novo sistema preparada.</p>
      </div>

      <section aria-label="Fundação dos módulos" className="mt-7 grid gap-3 md:grid-cols-3">
        {foundations.map(({ title, detail, icon: Icon }) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 sm:p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></div>
            <h2 className="mt-5 text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{detail}</p>
            <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">Estrutura inicial</div>
          </article>
        ))}
      </section>
    </div>
  );
}
