"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthControl({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!authenticated) return null;
  async function signOut() {
    setBusy(true); setError("");
    try { const { error: signOutError } = await getSupabaseBrowserClient().auth.signOut(); if (signOutError) throw signOutError; router.replace("/"); router.refresh(); }
    catch { setError("Não foi possível encerrar a sessão. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <span className="inline-flex items-center gap-1"><button type="button" disabled={busy} onClick={signOut} aria-label="Sair" title="Sair" className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"><LogOut size={15} /></button>{error && <span role="alert" className="max-w-32 text-[10px] text-rose-300">{error}</span>}</span>;
}
