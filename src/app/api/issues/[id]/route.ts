import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, publicErrorMessage } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

const priorities = ["Baixa", "Média", "Alta", "Crítica"];
const statuses = ["Aberta", "Em andamento", "Aguardando terceiro", "Resolvida"];
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Confira os dados da pendência." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Confira os dados da pendência." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const allowed = ["title", "description", "stageId", "owner", "vendorId", "priority", "due", "status"];
  if (Object.keys(input).some((key) => !allowed.includes(key)) || Object.keys(input).length === 0 || input.title !== undefined && (typeof input.title !== "string" || !input.title.trim() || input.title.length > 180) || input.description !== undefined && input.description !== null && (typeof input.description !== "string" || input.description.length > 2000) || input.stageId !== undefined && input.stageId !== null && typeof input.stageId !== "string" || input.owner !== undefined && (typeof input.owner !== "string" || input.owner.length > 120) || input.vendorId !== undefined && input.vendorId !== null && typeof input.vendorId !== "string" || input.priority !== undefined && (typeof input.priority !== "string" || !priorities.includes(input.priority)) || input.status !== undefined && (typeof input.status !== "string" || !statuses.includes(input.status)) || input.due !== undefined && input.due !== null && (typeof input.due !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.due))) return NextResponse.json({ error: "Confira os campos da pendência." }, { status: 400 });
  let supabase;
  try { supabase = await getSupabaseServerClient(); } catch { return NextResponse.json({ error: "O serviço está indisponível. Tente novamente." }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Entre para gerenciar pendências.", loginUrl: `/login?next=${encodeURIComponent(new URL(request.url).pathname)}` }, { status: 401 });
  const { id } = await params;
  const { data: current } = await supabase.from("issues").select("project_id").eq("id", id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Esta pendência não foi encontrada." }, { status: 404 });
  if (typeof input.stageId === "string") { const { data } = await supabase.from("project_stages").select("id").eq("id", input.stageId).eq("project_id", current.project_id).maybeSingle(); if (!data) return NextResponse.json({ error: "A etapa selecionada não pertence ao projeto." }, { status: 400 }); }
  if (typeof input.vendorId === "string") { const { data } = await supabase.from("project_vendors").select("id").eq("vendor_id", input.vendorId).eq("project_id", current.project_id).maybeSingle(); if (!data) return NextResponse.json({ error: "O terceirizado selecionado não está vinculado ao projeto." }, { status: 400 }); }
  const patch: Database["public"]["Tables"]["issues"]["Update"] = {};
  if (input.title !== undefined) patch.title = (input.title as string).trim();
  if (input.description !== undefined) patch.description = typeof input.description === "string" ? input.description.trim() || null : null;
  if (input.stageId !== undefined) patch.stage_id = input.stageId;
  if (input.owner !== undefined) patch.owner_name = (input.owner as string).trim() || null;
  if (input.vendorId !== undefined) patch.vendor_id = input.vendorId;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.due !== undefined) patch.due_date = input.due;
  if (input.status !== undefined) { patch.status = input.status; if (input.status === "Resolvida") patch.resolved_at = new Date().toISOString(); else patch.resolved_at = null; }
  const { error } = await supabase.from("issues").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: publicErrorMessage(error) }, { status: error.code === "42501" || error.code === "PGRST301" ? 403 : 500 });
  revalidatePath("/"); revalidatePath("/issues"); revalidatePath(`/projects/${current.project_id}`); revalidatePath("/contractors");
  return NextResponse.json({ success: true });
}
