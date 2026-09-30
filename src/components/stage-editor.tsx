"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import type { Stage } from "@/types";
import { useModalAccessibility } from "@/hooks/use-modal-accessibility";

const statuses = ["Não iniciado", "Em andamento", "Aguardando terceiro", "Bloqueado", "Concluído", "Atrasado"];
export function StageEditor({ stage }: { stage: Stage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const close = useCallback(() => setOpen(false), []);
  const { triggerRef, dialogRef, onKeyDown } = useModalAccessibility(open, close);
  const [status, setStatus] = useState(stage.status); const [progress, setProgress] = useState(stage.progress); const [owner, setOwner] = useState(stage.owner === "Não atribuído" ? "" : stage.owner); const [start, setStart] = useState(stage.start); const [end, setEnd] = useState(stage.end); const [note, setNote] = useState(stage.note ?? ""); const [actualEnd, setActualEnd] = useState(stage.actualEnd ?? new Date().toISOString().slice(0, 10));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/stages/${stage.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, progress: Number(progress), owner, start: start || null, end: end || null, note, actualEnd: status === "Concluído" ? actualEnd : null }) });
      const result = await response.json();
      if (response.status === 401) { router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.hash)}`); return; }
      if (!response.ok) throw new Error(result.error ?? "Não foi possível atualizar a etapa.");
      setOpen(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Verifique a conexão e tente novamente."); }
    finally { setBusy(false); }
  }
  const field = "h-10 w-full rounded-md border border-line bg-white px-3 text-xs outline-none focus:border-emerald-600";
  return <><button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line px-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50" aria-label={`Editar etapa ${stage.name}`}><Pencil size={12} /> Editar</button>{open && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section ref={dialogRef} onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-labelledby={`stage-title-${stage.id}`} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-xl"><div className="flex items-start justify-between"><div><h2 id={`stage-title-${stage.id}`} className="text-base font-semibold">Atualizar etapa</h2><p className="mt-1 text-xs text-slate-500">{stage.name}</p></div><button type="button" onClick={close} aria-label="Fechar" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={17} /></button></div><form onSubmit={save} className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-medium">Status<select className={`${field} mt-1`} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[11px] font-medium">Progresso (%)<input className={`${field} mt-1`} type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Math.max(0, Math.min(100, Number(e.target.value))))} /></label><label className="text-[11px] font-medium sm:col-span-2">Responsável<input className={`${field} mt-1`} maxLength={120} value={owner} onChange={(e) => setOwner(e.target.value)} /></label><label className="text-[11px] font-medium">Início previsto<input className={`${field} mt-1`} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className="text-[11px] font-medium">Fim previsto<input className={`${field} mt-1`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>{status === "Concluído" && <label className="text-[11px] font-medium sm:col-span-2">Conclusão real<input className={`${field} mt-1`} type="date" value={actualEnd} onChange={(e) => setActualEnd(e.target.value)} /></label>}<label className="text-[11px] font-medium sm:col-span-2">Observação<textarea className="mt-1 w-full rounded-md border border-line p-3 text-xs outline-none focus:border-emerald-600" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></label>{error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-xs text-rose-800 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 pt-1 sm:col-span-2"><button type="button" onClick={close} className="min-h-10 rounded-md border border-line px-4 text-xs">Cancelar</button><button disabled={busy} className="min-h-10 rounded-md bg-forest px-4 text-xs font-medium text-white disabled:opacity-60">{busy ? "Salvando…" : "Salvar etapa"}</button></div></form></section></div>}</>;
}
