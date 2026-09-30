export function ProgressBar({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className="flex items-center gap-2.5"><div className={`h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 ${compact ? "max-w-24" : ""}`}><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${value}%` }} /></div><span className="min-w-8 text-right text-xs font-medium text-slate-600">{value}%</span></div>;
}
