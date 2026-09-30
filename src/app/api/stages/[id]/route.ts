import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, publicErrorMessage } from "@/lib/supabase/server";

const statuses = ["Não iniciado", "Em andamento", "Aguardando terceiro", "Bloqueado", "Concluído", "Atrasado"];
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Confira os dados da etapa." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Confira os dados da etapa." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (typeof input.status !== "string" || !statuses.includes(input.status) || !Number.isInteger(input.progress) || Number(input.progress) < 0 || Number(input.progress) > 100 || typeof input.owner !== "string" || input.owner.length > 120 || input.start !== null && input.start !== "" && (typeof input.start !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.start)) || input.end !== null && input.end !== "" && (typeof input.end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.end)) || typeof input.note !== "string" || input.note.length > 1000 || input.actualEnd !== null && input.actualEnd !== "" && (typeof input.actualEnd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.actualEnd))) return NextResponse.json({ error: "Confira status, progresso, responsável e datas." }, { status: 400 });
  let supabase;
  try { supabase = await getSupabaseServerClient(); } catch { return NextResponse.json({ error: "O serviço está indisponível. Tente novamente." }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Entre para atualizar uma etapa.", loginUrl: `/login?next=${encodeURIComponent(new URL(request.url).pathname)}` }, { status: 401 });
  const { id } = await params;
  const { data: current, error: lookupError } = await supabase.from("project_stages").select("project_id").eq("id", id).maybeSingle();
  if (lookupError || !current) return NextResponse.json({ error: "Esta etapa não foi encontrada." }, { status: 404 });
  const { error } = await supabase.from("project_stages").update({ status: input.status, progress: Number(input.progress), owner_name: String(input.owner).trim() || null, planned_start_date: typeof input.start === "string" && input.start ? input.start : null, planned_end_date: typeof input.end === "string" && input.end ? input.end : null, notes: String(input.note).trim() || null, ...(input.status === "Concluído" ? { actual_end_date: typeof input.actualEnd === "string" && input.actualEnd ? input.actualEnd : new Date().toISOString().slice(0, 10) } : {}) }).eq("id", id);
  if (error) return NextResponse.json({ error: publicErrorMessage(error) }, { status: error.code === "42501" || error.code === "PGRST301" ? 403 : 500 });
  revalidatePath("/"); revalidatePath(`/projects/${current.project_id}`); revalidatePath("/projects");
  return NextResponse.json({ success: true });
}
