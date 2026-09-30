"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";
import type { Issue, Project } from "@/types";
import { useModalAccessibility } from "@/hooks/use-modal-accessibility";

type Vendor = { id: string; name: string };
const priorities = ["Baixa", "Média", "Alta", "Crítica"] as const;
const statuses = ["Aberta", "Em andamento", "Aguardando terceiro", "Resolvida"] as const;
type Props = { projects: Project[]; vendors: Vendor[]; vendorIdsByProject?: Record<string, string[]>; issue?: Issue; defaultProjectId?: string };
export function IssueEditor({ projects, vendors, vendorIdsByProject, issue, defaultProjectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const close = useCallback(() => setOpen(false), []);
  const { triggerRef, dialogRef, onKeyDown } = useModalAccessibility(open, close);
  const [projectId, setProjectId] = useState(issue?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "");
  const [stageId, setStageId] = useState(issue?.stageId ?? ""); const [vendorId, setVendorId] = useState(issue?.contractorId ?? "");
  const [title, setTitle] = useState(issue?.title ?? ""); const [description, setDescription] = useState(issue?.description ?? ""); const [owner, setOwner] = useState(issue?.owner === "Não atribuído" ? "" : issue?.owner ?? ""); const [priority, setPriority] = useState<Issue["priority"]>(issue?.priority ?? "Média"); const [status, setStatus] = useState<Issue["status"]>(issue?.status ?? "Aberta"); const [due, setDue] = useState(issue?.due ?? "");
  const project = projects.find((item) => item.id === projectId);
  const availableVendors = vendors.filter((vendor) => !vendorIdsByProject || vendorIdsByProject[projectId]?.includes(vendor.id));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { title, description: description || null, projectId, stageId: stageId || null, owner, vendorId: vendorId || null, priority, status, due: due || null };
    try {
      const response = await fetch(issue ? `/api/issues/${issue.id}` : "/api/issues", { method: issue ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(issue ? { description: payload.description, stageId: payload.stageId, owner, vendorId: payload.vendorId, priority, status, due: payload.due } : payload) });
      const result = await response.json();
      if (response.status === 401) { router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.hash)}`); return; }
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar a pendência.");
      close(); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Verifique a conexão e tente novamente."); }
    finally { setBusy(false); }
  }
  const field = "mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-xs outline-none focus:border-emerald-600";
  return <><button ref={triggerRef} type="button" onClick={() => setOpen(true)} className={issue ? "inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line px-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50" : "inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-4 text-xs font-medium text-white hover:bg-emerald-800"}>{issue ? <><Pencil size={12} /> Editar</> : <><Plus size={14} /> Nova pendência</>}</button>{open && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section ref={dialogRef} onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-labelledby="issue-editor-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:max-w-xl sm:rounded-xl"><div className="flex items-start justify-between"><div><h2 id="issue-editor-title" className="text-base font-semibold">{issue ? "Editar pendência" : "Nova pendência"}</h2><p className="mt-1 text-xs text-slate-500">Acompanhe responsável, prazo e próxima ação.</p></div><button type="button" onClick={close} aria-label="Fechar" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={17} /></button></div><form onSubmit={save} className="mt-5 grid gap-3 sm:grid-cols-2">{!issue && <label className="text-[11px] font-medium sm:col-span-2">Título<input required maxLength={180} className={field} value={title} onChange={(e) => setTitle(e.target.value)} /></label>}{!issue && <label className="text-[11px] font-medium sm:col-span-2">Projeto<select required className={field} value={projectId} onChange={(e) => { setProjectId(e.target.value); setStageId(""); setVendorId(""); }}><option value="">Selecione um projeto</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<label className="text-[11px] font-medium sm:col-span-2">Descrição<textarea className="mt-1 w-full rounded-md border border-line p-3 text-xs outline-none focus:border-emerald-600" rows={3} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} /></label><label className="text-[11px] font-medium">Etapa<select className={field} value={stageId} onChange={(e) => setStageId(e.target.value)}><option value="">Sem etapa</option>{project?.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label><label className="text-[11px] font-medium">Terceirizado<select className={field} value={vendorId} onChange={(e) => setVendorId(e.target.value)}><option value="">Equipe interna / nenhum</option>{availableVendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label><label className="text-[11px] font-medium">Responsável<input className={field} maxLength={120} value={owner} onChange={(e) => setOwner(e.target.value)} /></label><label className="text-[11px] font-medium">Prioridade<select className={field} value={priority} onChange={(e) => setPriority(e.target.value as Issue["priority"])}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[11px] font-medium">Prazo<input className={field} type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label><label className="text-[11px] font-medium">Status<select className={field} value={status} onChange={(e) => setStatus(e.target.value as Issue["status"])}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>{error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-xs text-rose-800 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 pt-1 sm:col-span-2"><button type="button" onClick={close} className="min-h-10 rounded-md border border-line px-4 text-xs">Cancelar</button><button disabled={busy} className="min-h-10 rounded-md bg-forest px-4 text-xs font-medium text-white disabled:opacity-60">{busy ? "Salvando…" : issue ? "Salvar alterações" : "Criar pendência"}</button></div></form></section></div>}</>;
}

export function ResolveIssueButton({ issue }: { issue: Issue }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function resolve() {
    setBusy(true); setError("");
    try { const response = await fetch(`/api/issues/${issue.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Resolvida" }) }); const result = await response.json(); if (response.status === 401) { router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.hash)}`); return; } if (!response.ok) throw new Error(result.error ?? "Não foi possível resolver a pendência."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Tente novamente."); }
    finally { setBusy(false); }
  }
  if (issue.status === "Resolvida") return null;
  return <span className="inline-flex flex-col items-end"><button type="button" disabled={busy} onClick={resolve} className="min-h-9 rounded-md bg-[#e7f1ea] px-2.5 text-[10px] font-medium text-forest hover:bg-emerald-100 disabled:opacity-60">{busy ? "Salvando…" : "Marcar resolvida"}</button>{error && <span role="alert" className="mt-1 max-w-40 text-right text-[10px] text-rose-700">{error}</span>}</span>;
}
