import type { ReactNode } from "react";
export function MetricCard({ label, value, note, icon, tone = "green" }: { label: string; value: string; note: string; icon: ReactNode; tone?: "green" | "amber" | "red" | "blue" }) {
  const colors = { green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", blue: "bg-blue-50 text-blue-700" };
  return <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5"><div className="flex items-start justify-between"><div className="text-[12px] font-medium text-slate-500">{label}</div><div className={`flex h-8 w-8 items-center justify-center rounded-md ${colors[tone]}`}>{icon}</div></div><div className="mt-3 text-[24px] font-semibold tracking-[-.035em] text-ink">{value}</div><div className="mt-1 text-[11px] text-slate-500">{note}</div></div>;
}
