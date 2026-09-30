import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, publicErrorMessage } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Confira os dados preenchidos e tente novamente." }, { status: 400 }); }
  if (!payload || typeof payload !== "object") return NextResponse.json({ error: "Confira os dados preenchidos e tente novamente." }, { status: 400 });
  const { projectId, stageId, issueId, progress, text } = payload as Record<string, unknown>;
  if (typeof projectId !== "string" || !projectId || typeof text !== "string" || !text.trim() || text.length > 800 || stageId !== null && stageId !== undefined && typeof stageId !== "string" || issueId !== null && issueId !== undefined && typeof issueId !== "string" || progress !== null && progress !== undefined && (!Number.isInteger(progress) || Number(progress) < 0 || Number(progress) > 100)) return NextResponse.json({ error: "Confira o projeto, o texto e o percentual informado." }, { status: 400 });
  let supabase;
  try { supabase = await getSupabaseServerClient(); } catch { return NextResponse.json({ error: "O serviço está indisponível. Tente novamente em instantes." }, { status: 503 }); }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Entre para registrar uma atualização.", loginUrl: `/login?next=${encodeURIComponent(new URL(request.url).pathname)}` }, { status: 401 });
  if (typeof stageId === "string") {
    const { data } = await supabase.from("project_stages").select("id").eq("id", stageId).eq("project_id", projectId).maybeSingle();
    if (!data) return NextResponse.json({ error: "A etapa selecionada não pertence a este projeto." }, { status: 400 });
  }
  if (typeof issueId === "string") {
    const { data } = await supabase.from("issues").select("id").eq("id", issueId).eq("project_id", projectId).maybeSingle();
    if (!data) return NextResponse.json({ error: "A pendência selecionada não pertence a este projeto." }, { status: 400 });
  }
  const { data, error } = await supabase.from("project_updates").insert({ project_id: projectId, stage_id: typeof stageId === "string" ? stageId : null, issue_id: typeof issueId === "string" ? issueId : null, progress: typeof progress === "number" ? progress : null, body: text.trim(), author_name: user.user_metadata.full_name ?? user.email ?? "Equipe de obra" }).select("id,project_id,stage_id,issue_id,author_name,body,progress,occurred_at").single();
  if (error) return NextResponse.json({ error: publicErrorMessage(error) }, { status: error.code === "42501" || error.code === "PGRST301" ? 403 : 500 });
  revalidatePath("/"); revalidatePath("/updates"); revalidatePath(`/projects/${projectId}`);
  return NextResponse.json({ update: data }, { status: 201 });
}
