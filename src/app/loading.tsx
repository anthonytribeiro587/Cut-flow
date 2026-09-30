export default function Loading() {
  return <div role="status" aria-live="polite" className="space-y-4"><span className="sr-only">Carregando CutFlow</span><div className="h-8 w-56 animate-pulse rounded bg-slate-200" /><div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 rounded-lg border border-slate-200 bg-white" />)}</div></div>;
}
