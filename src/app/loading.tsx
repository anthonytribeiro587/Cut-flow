export default function Loading() {
  return <div role="status" aria-live="polite" className="space-y-4"><span className="sr-only">Carregando dados da obra</span><div className="h-8 w-56 animate-pulse rounded bg-slate-200" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-lg border border-line bg-white" />)}</div><div className="h-72 animate-pulse rounded-lg border border-line bg-white" /></div>;
}
