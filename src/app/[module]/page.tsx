import { notFound } from "next/navigation";

const modules: Record<string, { title: string; description: string }> = {
  quotes: { title: "Orçamentos", description: "Estrutura inicial do módulo de orçamentos." },
  processes: { title: "Processos", description: "Estrutura inicial do módulo de processos." },
  orders: { title: "Pedidos", description: "Estrutura inicial do módulo de pedidos." },
  production: { title: "Produção", description: "Estrutura inicial do módulo de produção." },
  scheduling: { title: "Planejamento", description: "Estrutura inicial do planejamento de capacidade." },
  customers: { title: "Clientes", description: "Estrutura inicial do módulo de clientes." },
  materials: { title: "Materiais", description: "Estrutura inicial do módulo de materiais." },
  machines: { title: "Máquinas", description: "Estrutura inicial do módulo de máquinas." },
  reports: { title: "Relatórios", description: "Estrutura inicial do módulo de relatórios." },
  settings: { title: "Configurações", description: "Estrutura inicial das configurações do CutFlow." },
};

export function generateStaticParams() {
  return Object.keys(modules).map((module) => ({ module }));
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const content = modules[module];
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="border-b border-slate-200 pb-7">
        <div className="text-xs font-medium text-slate-500">CutFlow</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950">{content.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{content.description}</p>
      </div>
      <div className="mt-7 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Módulo preparado para as próximas etapas.</p>
      </div>
    </div>
  );
}
