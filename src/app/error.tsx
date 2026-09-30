"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[CutFlow] Falha ao carregar a página", { digest: error.digest }); }, [error.digest]);
  return <section role="alert" className="rounded-lg border border-slate-200 bg-white p-6"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 text-rose-600" size={19} /><div><h1 className="text-sm font-semibold">Não foi possível carregar o CutFlow</h1><p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">Tente novamente ou atualize a página.</p><button onClick={reset} className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"><RotateCw size={13} /> Tentar novamente</button></div></div></section>;
}
