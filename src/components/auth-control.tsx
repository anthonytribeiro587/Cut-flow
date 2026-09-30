"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthControl({ authenticated }: { authenticated: boolean }) {
  const [busy, setBusy] = useState(false);
  if (!authenticated) return null;
  async function signOut() {
    setBusy(true);
    try { await getSupabaseBrowserClient().auth.signOut({ scope: "local" }); } catch { /* The local route transition still clears protected UI. */ }
    window.location.replace("/login");
  }
  return <button type="button" disabled={busy} onClick={signOut} aria-label="Sair" title="Sair" className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"><LogOut size={15} /></button>;
}
