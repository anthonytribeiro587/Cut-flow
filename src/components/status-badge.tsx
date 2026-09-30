import type { IssueStatus, Priority, ProjectStatus, StageStatus } from "@/types";

type Status = ProjectStatus | StageStatus | IssueStatus | Priority;
const styles: Record<string, string> = {
  "Em andamento": "bg-blue-50 text-blue-700 ring-blue-700/10", "Atenção": "bg-amber-50 text-amber-800 ring-amber-700/10", "Atrasado": "bg-rose-50 text-rose-700 ring-rose-700/10", "Planejamento": "bg-slate-100 text-slate-700 ring-slate-600/10", "Concluído": "bg-emerald-50 text-emerald-700 ring-emerald-700/10", "Não iniciado": "bg-slate-100 text-slate-600 ring-slate-600/10", "Aguardando terceiro": "bg-violet-50 text-violet-700 ring-violet-700/10", "Bloqueado": "bg-rose-50 text-rose-700 ring-rose-700/10", "Aberta": "bg-amber-50 text-amber-800 ring-amber-700/10", "Resolvida": "bg-emerald-50 text-emerald-700 ring-emerald-700/10", "Baixa": "bg-slate-100 text-slate-600 ring-slate-600/10", "Média": "bg-blue-50 text-blue-700 ring-blue-700/10", "Alta": "bg-orange-50 text-orange-700 ring-orange-700/10", "Crítica": "bg-rose-50 text-rose-700 ring-rose-700/10",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}
