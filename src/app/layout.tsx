import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Obra.flux | Gestão de projetos", description: "Acompanhamento centralizado de projetos e obras." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let email: string | null = null;
  try { const supabase = await getSupabaseServerClient(); email = (await supabase.auth.getUser()).data.user?.email ?? null; } catch { /* Middleware handles unavailable or expired sessions. */ }
  return <html lang="pt-BR"><body><AppShell userEmail={email}>{children}</AppShell></body></html>;
}
