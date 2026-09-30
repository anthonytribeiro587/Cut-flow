"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const { error: authError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) { setError("E-mail ou senha inválidos. Confira os dados e tente novamente."); return; }
      router.replace(nextPath); router.refresh();
    } catch { setError("Não foi possível entrar agora. Verifique sua conexão e tente novamente."); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-md rounded-lg border border-line bg-white p-5 shadow-soft sm:p-7"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4eee8] text-forest"><LogIn size={19} /></div><h1 className="text-xl font-semibold">Entrar</h1><p className="mt-1 text-sm text-slate-500">Acesse para registrar atualizações e acompanhar a operação.</p><form onSubmit={submit} className="mt-6 space-y-4"><div><label htmlFor="email" className="mb-1.5 block text-xs font-medium">E-mail</label><input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-emerald-600" /></div><div><label htmlFor="password" className="mb-1.5 block text-xs font-medium">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-emerald-600" /></div>{error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}<button disabled={busy} type="submit" className="flex h-11 w-full items-center justify-center rounded-md bg-forest text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{busy ? "Entrando…" : "Entrar"}</button></form><p className="mt-4 text-center text-[11px] text-slate-500">Acesso fornecido pela equipe responsável.</p></section>;
}
