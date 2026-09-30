import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export class DataAccessError extends Error {
  constructor(message = "Não foi possível carregar os dados agora.") {
    super(message);
    this.name = "DataAccessError";
  }
}

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new DataAccessError("A conexão com a base de demonstração não está configurada.");
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; middleware refreshes the session. */ }
      },
    },
  });
}

export function publicErrorMessage(error: { code?: string; message?: string }) {
  console.error("[Supabase] operational request failed", { code: error.code, message: error.message });
  if (error.code === "42501" || error.code === "PGRST301" || error.code === "PGRST303") return "Sua sessão expirou ou não tem permissão para esta ação. Entre novamente e tente de novo.";
  if (error.code === "23503" || error.code === "23514" || error.code === "22P02") return "Confira os dados selecionados e tente novamente.";
  return "Não foi possível concluir agora. Verifique sua conexão e tente novamente.";
}

export function throwDataError(context: string, error: { code?: string; message?: string }) {
  console.error(`[Supabase] ${context}`, { code: error.code, message: error.message });
  if (error.code === "42501" || error.code === "PGRST301") throw new DataAccessError("Seu acesso não permite consultar estes dados.");
  throw new DataAccessError();
}
