import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, publicErrorMessage } from "@/lib/supabase/server";

const priorities = ["Baixa", "Média", "Alta", "Crítica"];
const statuses = ["Aberta", "Em andamento", "Aguardando terceiro", "Resolvida"];
type IssueInput = { title: string; description: string | null; projectId: string; stageId: string | null; owner: string; vendorId: string | null; priority: string; due: string | null; status: string };
function valid(input: Record<string, unknown>): input is Record<string, IssueInput[keyof IssueInput]> {
  return typeof input.title === "string" && !!input.title.trim() && input.title.length <= 180 && (input.description === null || typeof input.description === "string" && input.description.length <= 2000) && typeof input.projectId === "string" && !!input.projectId && (input.stageId === null || typeof input.stageId === "string") && typeof input.owner === "string" && input.owner.length <= 120 && (input.vendorId === null || typeof input.vendorId === "string") && typeof input.priority === "string" && priorities.includes(input.priority) && typeof input.status === "string" && statuses.includes(input.status) && (input.due === null || typeof input.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.due));
}
async function authorized(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Entre para gerenciar pendências.", loginUrl: `/login?next=${encodeURIComponent(new URL(request.url).pathname)}` }, { status: 401 }) };
  return { supabase, user };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Confira os dados da pendência." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !valid(body as Record<string, unknown>)) return NextResponse.json({ error: "Confira título, projeto, prioridade, responsável e prazo." }, { status: 400 });
  let auth: Awaited<ReturnType<typeof authorized>>;
  try { auth = await authorized(request); } catch { return NextResponse.json({ error: "O serviço está indisponível. Tente novamente." }, { status: 503 }); }
  if ("response" in auth) return auth.response;
  const input = body as unknown as IssueInput;
  if (input.stageId) { const { data } = await auth.supabase.from("project_stages").select("id").eq("id", input.stageId).eq("project_id", input.projectId).maybeSingle(); if (!data) return NextResponse.json({ error: "A etapa selecionada não pertence ao projeto." }, { status: 400 }); }
  if (input.vendorId) { const { data } = await auth.supabase.from("project_vendors").select("id").eq("vendor_id", input.vendorId).eq("project_id", input.projectId).maybeSingle(); if (!data) return NextResponse.json({ error: "O terceirizado selecionado não está vinculado ao projeto." }, { status: 400 }); }
  const { data, error } = await auth.supabase.from("issues").insert({ project_id: input.projectId, stage_id: input.stageId, vendor_id: input.vendorId, title: input.title.trim(), description: input.description?.trim() || null, priority: input.priority, status: input.status, owner_name: input.owner.trim() || null, due_date: input.due, resolved_at: input.status === "Resolvida" ? new Date().toISOString() : null }).select("id").single();
  if (error) return NextResponse.json({ error: publicErrorMessage(error) }, { status: error.code === "42501" || error.code === "PGRST301" ? 403 : 500 });
  revalidatePath("/"); revalidatePath("/issues"); revalidatePath(`/projects/${input.projectId}`); revalidatePath("/contractors");
  return NextResponse.json({ id: data.id }, { status: 201 });
}
